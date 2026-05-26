# app/modules/dominio_3/Pedidos/service.py
"""
PedidoService — lógica de negocio para pedidos.

FSM (máquina de estados) — transiciones válidas:
  PENDIENTE   → CONFIRMADO, CANCELADO
  CONFIRMADO  → EN_PREP,    CANCELADO
  EN_PREP     → EN_CAMINO
  EN_CAMINO   → ENTREGADO
  ENTREGADO   → (terminal)
  CANCELADO   → (terminal)

Reglas importantes del UML:
  - La validación de la FSM va en el SERVICE, nunca en el router.
  - HistorialEstadoPedido es append-only: solo INSERT.
  - DetallePedido usa Snapshot Pattern: guarda nombre y precio
    del producto AL MOMENTO de crear el pedido.
  - CLIENT solo puede cancelar desde PENDIENTE o CONFIRMADO.
  - ADMIN/PEDIDOS pueden avanzar cualquier estado no terminal.
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional

from fastapi import HTTPException, status

from app.core.unit_of_work import UnitOfWork
from app.modules.dominio_3.Pedidos.models import (
    Pedido, DetallePedido, HistorialEstadoPedido,
)
from app.modules.dominio_3.Pedidos.schemas import (
    PedidoCreate, PedidoRead, PedidoList,
    DetallePedidoRead, HistorialRead, AvanzarEstadoInput,
)

# ── FSM ───────────────────────────────────────────────────────────────────────
# Define qué estados son alcanzables desde cada estado
TRANSICIONES: dict[str, list[str]] = {
    "PENDIENTE":  ["CONFIRMADO", "CANCELADO"],
    "CONFIRMADO": ["PREPARACION", "CANCELADO"],
    "PREPARACION":    ["ENVIADO"],
    "ENVIADO":  ["ENTREGADO"],
    "ENTREGADO":  [],   # terminal
    "CANCELADO":  [],   # terminal
}

# Estados desde los que el cliente puede cancelar
CANCELABLES_POR_CLIENTE = {"PENDIENTE", "CONFIRMADO"}


class PedidoService:

    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    # ── Crear pedido ──────────────────────────────────────────────────────────
    def crear(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        """
        Crea un pedido desde el carrito con transacción atómica (UoW).
        Aplica Snapshot Pattern en cada DetallePedido.
        """
        if not data.items:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="El pedido debe tener al menos un ítem",
            )

        # Validar forma de pago
        forma = self.uow.formas_pago.get_by_id(data.forma_pago_codigo)
        if not forma or not forma.habilitado:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Forma de pago inválida o no habilitada",
            )

        # Construir detalles con snapshot
        detalles_data = []
        subtotal = Decimal("0.00")

        for item in data.items:
            producto = self.uow.productos.get_by_id(item.producto_id)
            if not producto or not producto.disponible:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Producto {item.producto_id} no disponible",
                )
            precio_snap = Decimal(str(producto.precio_base))
            sub = precio_snap * item.cantidad
            subtotal += sub
            detalles_data.append({
                "producto_id":     item.producto_id,
                "cantidad":        item.cantidad,
                "nombre_snapshot": producto.nombre,   # snapshot
                "precio_snapshot": precio_snap,        # snapshot
                "subtotal":        sub,
                "personalizacion": item.personalizacion,
            })

        total = subtotal  # sin descuento ni envío por ahora

        # Crear cabecera
        pedido = Pedido(
            usuario_id=usuario_id,
            direccion_id=data.direccion_id,
            estado_codigo="PENDIENTE",
            forma_pago_codigo=data.forma_pago_codigo,
            subtotal=subtotal,
            descuento=Decimal("0.00"),
            costo_envio=Decimal("0.00"),
            total=total,
            notas=data.notas,
        )
        pedido = self.uow.pedidos.add(pedido)

        # Crear detalles
        for d in detalles_data:
            self.uow.detalles.add(DetallePedido(pedido_id=pedido.id, **d))

        # Primer registro del historial (estado_desde=NULL → creación)
        self.uow.historial.add(
            HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=None,
                estado_hacia="PENDIENTE",
                usuario_id=usuario_id,
                motivo="Pedido creado",
            )
        )

        return self._to_read(pedido)

    # ── Avanzar estado ────────────────────────────────────────────────────────
    def avanzar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str,
        actor_id: int,
        roles: list[str],
        data: AvanzarEstadoInput,
    ) -> PedidoRead:
        """
        Avanza el estado del pedido validando la FSM.
        La validación ocurre aquí, nunca en el router.
        """
        pedido = self._get_o_404(pedido_id)
        estado_actual = pedido.estado_codigo

        # Validar que la transición sea válida en la FSM
        permitidos = TRANSICIONES.get(estado_actual, [])
        if nuevo_estado not in permitidos:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Transición inválida: {estado_actual} → {nuevo_estado}. "
                       f"Permitidos: {permitidos}",
            )

        # Si es CLIENT, solo puede cancelar y solo desde estados cancelables
        if "CLIENT" in roles and not any(r in ["ADMIN", "PEDIDOS"] for r in roles):
            if nuevo_estado != "CANCELADO":
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="El cliente solo puede cancelar su pedido",
                )
            if estado_actual not in CANCELABLES_POR_CLIENTE:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Solo podés cancelar desde PENDIENTE o CONFIRMADO. Estado actual: {estado_actual}",
                )

        # Actualizar estado
        estado_anterior = pedido.estado_codigo
        pedido.estado_codigo = nuevo_estado
        pedido.updated_at = datetime.now(timezone.utc)
        self.uow.pedidos.update(pedido)

        # Registrar en historial (append-only)
        self.uow.historial.add(
            HistorialEstadoPedido(
                pedido_id=pedido.id,
                estado_desde=estado_anterior,
                estado_hacia=nuevo_estado,
                usuario_id=actor_id,
                motivo=data.motivo,
            )
        )

        return self._to_read(pedido)

    # ── Listar ────────────────────────────────────────────────────────────────
    def listar(
        self,
        usuario_id: int,
        roles: list[str],
        offset: int,
        limit: int,
    ) -> PedidoList:
        """
        CLIENT ve solo sus pedidos.
        ADMIN / PEDIDOS ven todos.
        """
        es_admin = any(r in ["ADMIN", "PEDIDOS"] for r in roles)

        if es_admin:
            pedidos = self.uow.pedidos.get_all_activos(offset, limit)
            total   = self.uow.pedidos.count_all()
        else:
            pedidos = self.uow.pedidos.get_by_usuario(usuario_id, offset, limit)
            total   = self.uow.pedidos.count_by_usuario(usuario_id)

        return PedidoList(
            data=[self._to_read(p) for p in pedidos],
            total=total,
        )

    # ── Detalle ───────────────────────────────────────────────────────────────
    def obtener(self, pedido_id: int, usuario_id: int, roles: list[str]) -> PedidoRead:
        pedido = self._get_o_404(pedido_id)

        # CLIENT solo puede ver sus propios pedidos
        es_admin = any(r in ["ADMIN", "PEDIDOS"] for r in roles)
        if not es_admin and pedido.usuario_id != usuario_id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN,
                                detail="No tenés acceso a este pedido")

        return self._to_read(pedido)

    # ── Historial ─────────────────────────────────────────────────────────────
    def historial(self, pedido_id: int) -> list[HistorialRead]:
        self._get_o_404(pedido_id)
        registros = self.uow.historial.get_by_pedido(pedido_id)
        return [
            HistorialRead(
                id=r.id,
                estado_desde=r.estado_desde,
                estado_hacia=r.estado_hacia,
                usuario_id=r.usuario_id,
                motivo=r.motivo,
                created_at=r.created_at,
            )
            for r in registros
        ]

    # ── Helpers ───────────────────────────────────────────────────────────────
    def _get_o_404(self, pedido_id: int) -> Pedido:
        pedido = self.uow.pedidos.get_by_id_con_detalles(pedido_id)
        if not pedido:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND,
                                detail="Pedido no encontrado")
        return pedido

    def _to_read(self, pedido: Pedido) -> PedidoRead:
        detalles = self.uow.detalles.get_by_pedido(pedido.id)
        return PedidoRead(
            id=pedido.id,
            usuario_id=pedido.usuario_id,
            direccion_id=pedido.direccion_id,
            estado_codigo=pedido.estado_codigo,
            forma_pago_codigo=pedido.forma_pago_codigo,
            subtotal=pedido.subtotal,
            descuento=pedido.descuento,
            costo_envio=pedido.costo_envio,
            total=pedido.total,
            notas=pedido.notas,
            created_at=pedido.created_at,
            detalles=[
                DetallePedidoRead(
                    producto_id=d.producto_id,
                    cantidad=d.cantidad,
                    nombre_snapshot=d.nombre_snapshot,
                    precio_snapshot=d.precio_snapshot,
                    subtotal=d.subtotal,
                    personalizacion=d.personalizacion,
                )
                for d in detalles
            ],
        )