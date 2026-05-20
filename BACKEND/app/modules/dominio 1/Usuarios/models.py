from SQLModel import DateTime
from decimal import Decimal
import uuid
from typing import Optional, List, ClassVar
from datetime import datetime, timezone
from sqlmodel import SQLModel, Field, Relationship
from sqlalchemy import Column, CHAR

# pyrefly: ignore [missing-import]
from app.core.minxins.auditable_mixin import UniqueAuditableMixin
# 1: TABLAS PRINCIPALES

class Rol(SQLModel, table=True):
    __tablename__ = "rol"
    codigo: str = Field(primary_key=True, max_length=20) 
    nombre: str = Field(unique=True, index=True, max_length=50)
    descripcion: Optional[str] = None
    #relaciom
    usuarios: List["Usuario"] = Relationship(back_populates="roles", link_model=UsuarioRol)


class Usuario(UniqueAuditableMixin, SQLModel, table=True):
    __tablename__ = "usuario"
    
    _unique_fields: ClassVar[List[str]] = ["email"]

    #id: Optional[int] = Field(default=None, primary_key=True)
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=80)
    apellido: str = Field(max_length=80)
    email: str = Field(max_length=254)
    celular: Optional[str] = Field(default=None, max_length=20)
    password_hash: str = Field(sa_column=Column(CHAR(60), nullable=False))

    #auditoria
    created_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
)
    updated_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    )
    deleted_at: Optional[datetime] = Field(default=None)

    #relaciones
    roles: List[Rol] = Relationship(back_populates="usuarios", link_model=UsuarioRol)
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="usuario")
    direcciones: List["DireccionEntrega"] = Relationship(back_populates="usuario")
# 2: TABLAS INTERMEDIAS
class UsuarioRol(SQLModel, table=True):
    __tablename__ = "usuario_rol"
 
    usuario_id:    int = Field(foreign_key="usuario.id",  primary_key=True)
    rol_codigo:    str = Field(foreign_key="rol.codigo",  primary_key=True)
 
    asignado_por_id:  Optional[int] = Field(default=None, foreign_key="usuario.id")
    expires_at:    Optional[datetime] = Field(default=None)
 
    created_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
)

# 3. ENTIDADES ASOCIADAS

class RefreshToken(SQLModel, table=True):
    __tablename__ = "refresh_token"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id:  int = Field(foreign_key="usuario.id", index=True)
    
    token_hash: str = Field(sa_column=Column(CHAR(64), unique=True, nullable=False))
    expires_at: datetime
    revoked_at: Optional[datetime] = None
    created_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
)

    usuario: Usuario = Relationship(back_populates="refresh_tokens")


class DireccionEntrega(SQLModel, table=True):
    __tablename__ = "direccion_entrega"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    
    alias: Optional[str] = Field(default=None, max_length=50)
    linea1: str
    linea2: Optional[str] = None
    ciudad: str = Field(max_length=100)
    provincia: Optional[str] = Field(default=None, max_length=100)
    codigo_postal: Optional[str] = Field(default=None, max_length=10)
    latitud:Optional[Decimal] = Field(default=None, decimal_places=6, max_digits=9)
    longitud:Optional[Decimal] = Field(default=None, decimal_places=6, max_digits=9)
    es_principal: bool = Field(default=False)

    #auditoria
    created_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    )
    updated_at: datetime = Field(
    sa_column=Column(DateTime(timezone=True), nullable=False, default=lambda: datetime.now(timezone.utc))
    )
    deleted_at: Optional[datetime] = Field(default=None)

    usuario: Usuario = Relationship(back_populates="direcciones")