# app/modules/dominio_3/Pedidos/router.py
"""
Router de Pedidos — /api/v1/pedidos/

Endpoints:
  POST   /                      → crear pedido (CLIENT+)
  GET    /                      → listar (CLIENT ve los suyos, ADMIN/PEDIDOS ven todos)
  GET    /{id}                  → detalle
  GET    /{id}/historial        → historial de estados
  PATCH  /{id}/estado/{codigo}  → avanzar estado (FSM validada en service)
  GET    /formas-pago           → catálogo de formas de pago habilitadas

Separación de roles en PATCH /estado:
  CLIENT  → solo puede cancelar desde PENDIENTE o CONFIRMADO
  PEDIDOS → puede avanzar cualquier estado no terminal
  ADMIN   → igual que PEDIDOS + acceso total
"""

from typing import Annotated

from fastapi import APIRouter, Cookie, Depends, Query, status

from app.core.deps import get_active_user, require_role, get_pedido_uow
from app.core.security import decode_access_token
from app.core.unit_of_work import UnitOfWork
from app.modules.dominio_1.Usuarios.models import Usuario
from app.modules.dominio_3.Pedidos.schemas import (AvanzarEstadoInput, FormaPagoRead, HistorialRead,PedidoCreate, PedidoList, PedidoRead)
from app.modules.dominio_3.Pedidos.services import PedidoService

router = APIRouter(prefix="/api/v1/pedidos", tags=["Pedidos"])


def _get_roles(access_token: str | None) -> list[str]:
    """Extrae roles del JWT sin hacer query a BD."""
    if not access_token:
        return []
    payload = decode_access_token(access_token)
    return payload.get("roles", []) if payload else []


# ── Catálogo público ──────────────────────────────────────────────────────────

@router.get(
    "/formas-pago",
    response_model=list[FormaPagoRead],
    summary="Listar formas de pago habilitadas",
)
def listar_formas_pago(uow: UnitOfWork = Depends(get_pedido_uow)):
    with uow:
        return uow.formas_pago.get_habilitadas()


# ── Crear pedido ──────────────────────────────────────────────────────────────

@router.post(
    "/",
    response_model=PedidoRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear pedido desde el carrito",
    dependencies=[Depends(require_role(["ADMIN", "PEDIDOS", "CLIENT"]))],
)
def crear_pedido(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_active_user)],
    uow: UnitOfWork = Depends(get_pedido_uow),
):
    with uow:
        return PedidoService(uow).crear(data, current_user.id)


# ── Listar pedidos ────────────────────────────────────────────────────────────

@router.get(
    "/",
    response_model=PedidoList,
    summary="Listar pedidos (CLIENT ve los suyos, ADMIN/PEDIDOS ven todos)",
    dependencies=[Depends(require_role(["ADMIN", "PEDIDOS", "CLIENT"]))],
)
def listar_pedidos(
    current_user: Annotated[Usuario, Depends(get_active_user)],
    access_token: Annotated[str | None, Cookie()] = None,
    offset: int = Query(default=0, ge=0),
    limit:  int = Query(default=20, ge=1, le=100),
    uow: UnitOfWork = Depends(get_pedido_uow),
):
    roles = _get_roles(access_token)
    with uow:
        return PedidoService(uow).listar(current_user.id, roles, offset, limit)


# ── Detalle ───────────────────────────────────────────────────────────────────

@router.get(
    "/{pedido_id}",
    response_model=PedidoRead,
    summary="Obtener detalle de un pedido",
    dependencies=[Depends(require_role(["ADMIN", "PEDIDOS", "CLIENT"]))],
)
def obtener_pedido(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_active_user)],
    access_token: Annotated[str | None, Cookie()] = None,
    uow: UnitOfWork = Depends(get_pedido_uow),
):
    roles = _get_roles(access_token)
    with uow:
        return PedidoService(uow).obtener(pedido_id, current_user.id, roles)


# ── Historial ─────────────────────────────────────────────────────────────────

@router.get(
    "/{pedido_id}/historial",
    response_model=list[HistorialRead],
    summary="Historial de estados del pedido",
    dependencies=[Depends(require_role(["ADMIN", "PEDIDOS", "CLIENT"]))],
)
def historial_pedido(
    pedido_id: int,
    uow: UnitOfWork = Depends(get_pedido_uow),
):
    with uow:
        return PedidoService(uow).historial(pedido_id)


# ── Avanzar estado ────────────────────────────────────────────────────────────

@router.patch(
    "/{pedido_id}/estado/{nuevo_estado}",
    response_model=PedidoRead,
    summary="Avanzar estado del pedido (FSM)",
    dependencies=[Depends(require_role(["ADMIN", "PEDIDOS", "CLIENT"]))],
)
def avanzar_estado(
    pedido_id:    int,
    nuevo_estado: str,
    data: AvanzarEstadoInput,
    current_user: Annotated[Usuario, Depends(get_active_user)],
    access_token: Annotated[str | None, Cookie()] = None,
    uow: UnitOfWork = Depends(get_pedido_uow),
):
    roles = _get_roles(access_token)
    with uow:
        return PedidoService(uow).avanzar_estado(
            pedido_id, nuevo_estado.upper(), current_user.id, roles, data
        )