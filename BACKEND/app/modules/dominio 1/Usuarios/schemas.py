from sqlmodel import SQLModel, Field
from pydantic import EmailStr
from typing import Optional, List
from datetime import datetime
class RolRead(SQLModel):
    codigo: str
    nombre: str
    descripcion: Optional[str] = None
    
class AsignarRolInput(SQLModel):
    roles: List[RolRead] = []
    
class UsuarioCreate(SQLModel):
    "creare"
    nombre:   str = Field(min_length=2, max_length=80)
    apellido: str = Field(min_length=2, max_length=80)
    email:    EmailStr
    celular:  Optional[str] = Field(default=None, max_length=20)
    password: str = Field(min_length=8)
 
 
class UsuarioRead(SQLModel):
    "vista"
    id:        int
    nombre:    str
    apellido:  str
    email:     str
    celular:   Optional[str]
    roles:     List[str] = []   
    deleted_at: Optional[datetime]
 
 
class Token(SQLModel):
    token_type: str = "bearer"
    expires_in: int 

class LoginInput(SQLModel):
    email:    EmailStr
    password: str


 
