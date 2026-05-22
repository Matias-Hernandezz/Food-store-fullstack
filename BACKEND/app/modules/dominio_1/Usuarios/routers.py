from typing import Annotated
from fastapi import APIRouter, Cookie, Depends, Response, status
from app.core.deps import get_active_user, get_uow
from app.core.security import COOKIE_ACCESS, COOKIE_REFRESH, REFRESH_TOKEN_EXPIRE_DAYS
from app.core.unit_of_work import UnitOfWork
from app.modules.dominio_1.Usuarios.unit_of_work import UsuarioUnitOfWork
from app.modules.dominio_1.Usuarios.models import Usuario
from app.modules.dominio_1.Usuarios.schemas import LoginInput, UsuarioCreate, UsuarioRead
from app.modules.dominio_1.Usuarios.services import AuthService

router = APIRouter(prefix="/api/v1/auth", tags=["Auth"])
_ACCESS_MAX_AGE  = 30 * 60
_REFRESH_MAX_AGE = REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60


def _set_cookies(response: Response, access: str, refresh: str) -> None:
    """Pone ambos tokens en cookies HttpOnly."""
    response.set_cookie(
        key=COOKIE_ACCESS,
        value=access,
        httponly=True,
        samesite="lax",
        secure=False,        
        max_age=_ACCESS_MAX_AGE,
    )
    response.set_cookie(
        key=COOKIE_REFRESH,
        value=refresh,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=_REFRESH_MAX_AGE,
        path="/api/v1/auth/refresh",
    )


def _clear_cookies(response: Response) -> None:
    """Borra ambas cookies del browser."""
    response.delete_cookie(COOKIE_ACCESS)
    response.delete_cookie(COOKIE_REFRESH, path="/api/v1/auth/refresh")


#endpoints primcipales

@router.post("/register", response_model=UsuarioRead, status_code=status.HTTP_201_CREATED)
def register(
    data: UsuarioCreate,
    uow: UsuarioUnitOfWork = Depends(get_uow),
):
    with uow:
        return AuthService(uow).register(data)


@router.post("/login", response_model=UsuarioRead)
def login(
    data: LoginInput,
    response: Response,
    uow: UsuarioUnitOfWork = Depends(get_uow),
):
    with uow:
        svc = AuthService(uow)
        access, refresh = svc.login(str(data.email), data.password)
        from app.core.security import decode_access_token
        usuario_id = int(decode_access_token(access)["sub"])
        usuario_read = svc.me(usuario_id)

    _set_cookies(response, access, refresh)
    return usuario_read


@router.post("/refresh", response_model=None, status_code=status.HTTP_204_NO_CONTENT)
def refresh(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
    uow: UsuarioUnitOfWork = Depends(get_uow),
):
    if not refresh_token:
        from fastapi import HTTPException
        raise HTTPException(status_code=401, detail="Sin refresh token")

    with uow:
        new_access = AuthService(uow).refresh(refresh_token)

    #renueva el access token solol(la cookie del refresh no cambia)
    response.set_cookie(
        key=COOKIE_ACCESS,
        value=new_access,
        httponly=True,
        samesite="lax",
        secure=False,
        max_age=_ACCESS_MAX_AGE,
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    response: Response,
    refresh_token: Annotated[str | None, Cookie()] = None,
    uow: UsuarioUnitOfWork = Depends(get_uow),
):
    if refresh_token:
        with uow:
            AuthService(uow).logout(refresh_token)
    _clear_cookies(response)


@router.get("/me", response_model=UsuarioRead)
def me(
    current_user: Annotated[Usuario, Depends(get_active_user)],
    uow: UsuarioUnitOfWork = Depends(get_uow),
):
    with uow:
        return AuthService(uow).me(current_user.id)