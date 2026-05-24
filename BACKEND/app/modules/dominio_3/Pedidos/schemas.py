# app/modules/dominio_3/Pedidos/schemas.py
from datetime import datetime
from decimal import Decimal
from typing import Optional, List
from sqlmodel import Field
from sqlmodel import SQLModel


# ── FormaPago ─────────────────────────────────────────────────────────────────

class FormaPagoRead(SQLModel):
    codigo:      str
    descripcion: str
    habilitado:  bool


# ── EstadoPedido ──────────────────────────────────────────────────────────────

class EstadoPedidoRead(SQLModel):
    codigo:      str
    descripcion: str
    orden:       int
    es_terminal: bool


# ── DetallePedido ─────────────────────────────────────────────────────────────

class ItemCarritoInput(SQLModel):
    """Un ítem del carrito al crear el pedido."""
    producto_id:     int
    cantidad:        int = Field(ge=1)
    personalizacion: Optional[int] = None


class DetallePedidoRead(SQLModel):
    producto_id:     int
    cantidad:        int
    nombre_snapshot: str
    precio_snapshot: Decimal
    subtotal:        Decimal
    personalizacion: Optional[int]


# ── Pedido ────────────────────────────────────────────────────────────────────

class PedidoCreate(SQLModel):
    """Body para crear un pedido desde el carrito."""
    direccion_id:      Optional[int] = None
    forma_pago_codigo: str
    notas:             Optional[str] = None
    items:             List[ItemCarritoInput]


class PedidoRead(SQLModel):
    id:                int
    usuario_id:        int
    direccion_id:      Optional[int]
    estado_codigo:     str
    forma_pago_codigo: str
    subtotal:          Decimal
    descuento:         Decimal
    costo_envio:       Decimal
    total:             Decimal
    notas:             Optional[str]
    created_at:        datetime
    detalles:          List[DetallePedidoRead] = []


class PedidoList(SQLModel):
    data:  List[PedidoRead]
    total: int


# ── Historial ─────────────────────────────────────────────────────────────────

class HistorialRead(SQLModel):
    id:           int
    estado_desde: Optional[str]
    estado_hacia: str
    usuario_id:   Optional[int]
    motivo:       Optional[str]
    created_at:   datetime


# ── Avanzar estado ────────────────────────────────────────────────────────────

class AvanzarEstadoInput(SQLModel):
    """Body para cambiar el estado de un pedido."""
    motivo: Optional[str] = None