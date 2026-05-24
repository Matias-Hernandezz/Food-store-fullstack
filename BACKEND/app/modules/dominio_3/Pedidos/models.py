# app/modules/dominio_3/Pedidos/models.py
"""
Modelos del Dominio 3 — Ventas, Pagos & Trazabilidad.

Tablas:
  FormaPago            → catálogo de formas de pago (seed)
  EstadoPedido         → catálogo de estados con FSM (seed)
  Pedido               → cabecera del pedido
  HistorialEstadoPedido → audit trail append-only (solo INSERT)
  DetallePedido        → ítems del pedido con snapshot de precio/nombre

Patrones importantes:
  Snapshot    : nombre_snapshot y precio_snapshot en DetallePedido son
                inmutables — guardan el valor AL MOMENTO de crear el pedido.
                Si el producto cambia de precio después, el pedido no cambia.

  Audit Trail : HistorialEstadoPedido nunca se actualiza ni elimina.
                Solo se insertan registros. Es el log de transiciones.

  Soft Delete : Pedido tiene deleted_at (los demás no lo necesitan).
"""

from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, List

from sqlmodel import SQLModel, Field, Relationship, Column
from sqlalchemy import TEXT


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


# ── 1. CATÁLOGOS (seed) ───────────────────────────────────────────────────────

class FormaPago(SQLModel, table=True):
    __tablename__ = "forma_pago"

    # PK semántica — legible en el pedido
    codigo:      str           = Field(primary_key=True, max_length=20)
    # Ej: "EFECTIVO", "MERCADOPAGO", "TRANSFERENCIA"
    descripcion: str           = Field(max_length=80)
    habilitado:  bool          = Field(default=True)
    # habilitado=False: registro histórico preservado,
    # oculto en formularios de nuevo pedido


class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estado_pedido"

    # PK semántica — se usa en el JWT payload y en la FSM
    codigo:       str           = Field(primary_key=True, max_length=20)
    # Ej: "PENDIENTE", "CONFIRMADO", "EN_PREP", "EN_CAMINO", "ENTREGADO", "CANCELADO"
    descripcion:  str           = Field(max_length=80)
    orden:        int           = Field()       # para ordenar en UI
    es_terminal:  bool          = Field(default=False)
    # es_terminal=True → no se puede avanzar más (ENTREGADO, CANCELADO)


# ── 2. PEDIDO (cabecera) ──────────────────────────────────────────────────────

class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id:              Optional[int] = Field(default=None, primary_key=True)

    # FK
    usuario_id:      int           = Field(foreign_key="usuario.id")
    direccion_id:    Optional[int] = Field(default=None, foreign_key="direccion_entrega.id")
    estado_codigo:   str           = Field(foreign_key="estado_pedido.codigo", default="PENDIENTE")
    forma_pago_codigo: str         = Field(foreign_key="forma_pago.codigo")

    # Snapshot monetario — inmutable desde creación
    subtotal:        Decimal       = Field(decimal_places=2, max_digits=10)
    descuento:       Decimal       = Field(default=Decimal("0.00"), decimal_places=2, max_digits=10)
    costo_envio:     Decimal       = Field(default=Decimal("0.00"), decimal_places=2, max_digits=10)
    total:           Decimal       = Field(decimal_places=2, max_digits=10)
    # total = subtotal - descuento + costo_envio

    notas:           Optional[str] = Field(default=None, sa_column=Column(TEXT))

    # Audit
    created_at:      datetime      = Field(default_factory=now_utc)
    updated_at:      datetime      = Field(default_factory=now_utc)
    deleted_at:      Optional[datetime] = Field(default=None)

    # Relaciones
    detalles:  List["DetallePedido"]        = Relationship(back_populates="pedido")
    historial: List["HistorialEstadoPedido"] = Relationship(back_populates="pedido")


# ── 3. HISTORIAL (audit trail append-only) ───────────────────────────────────

class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historial_estado_pedido"
    """
    REGLA: solo INSERTs. Nunca UPDATE ni DELETE.
    Es el log de auditoría de transiciones de estado.

    usuario_id=NULL → actor es el sistema (ej: webhook, job)
    """

    id:           Optional[int] = Field(default=None, primary_key=True)

    # FK
    pedido_id:    int           = Field(foreign_key="pedido.id", index=True)
    estado_desde: Optional[str] = Field(default=None, foreign_key="estado_pedido.codigo")
    # NULL en el primer registro (creación del pedido)
    estado_hacia: str           = Field(foreign_key="estado_pedido.codigo")
    usuario_id:   Optional[int] = Field(default=None, foreign_key="usuario.id")
    # NULL = sistema

    motivo:       Optional[str] = Field(default=None, sa_column=Column(TEXT))

    # Solo created_at — append-only, no tiene updated_at
    created_at:   datetime      = Field(default_factory=now_utc)

    # Relación
    pedido: Pedido = Relationship(back_populates="historial")


# ── 4. DETALLE (ítems del pedido) ─────────────────────────────────────────────

class DetallePedido(SQLModel, table=True):
    __tablename__ = "detalle_pedido"
    """
    PK compuesta: (pedido_id, producto_id)

    Snapshot Pattern:
      nombre_snapshot y precio_snapshot se copian del producto
      AL MOMENTO de crear el pedido. Son inmutables.
      Si el producto cambia después, el detalle no cambia.
    """

    pedido_id:        int     = Field(foreign_key="pedido.id",   primary_key=True)
    producto_id:      int     = Field(foreign_key="producto.id", primary_key=True)

    cantidad:         int     = Field(ge=1)

    # Snapshot — inmutable desde creación
    nombre_snapshot:  str     = Field(max_length=200)
    precio_snapshot:  Decimal = Field(decimal_places=2, max_digits=10, ge=Decimal("0"))

    subtotal:         Decimal = Field(decimal_places=2, max_digits=10, ge=Decimal("0"))
    # subtotal = cantidad * precio_snapshot

    personalizacion:  Optional[int] = Field(default=None)
    # INTEGER para personalización (ej: id de combinación de ingredientes)

    # Audit
    created_at:       datetime = Field(default_factory=now_utc)

    # Relación
    pedido: Pedido = Relationship(back_populates="detalles")