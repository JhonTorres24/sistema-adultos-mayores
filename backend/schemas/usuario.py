from pydantic import BaseModel, EmailStr
from typing import Optional

# Esquema base (lo que comparten todos)
class UsuarioBase(BaseModel):
    nombre: str
    correo: str # Lo ideal es usar EmailStr, pero requiere una librería extra. Usaremos str por ahora.
    rol: Optional[str] = "cuidador"

# Esquema para CREAR un usuario (incluye contraseña)
class UsuarioCreate(UsuarioBase):
    password: str

# Esquema para RESPONDER al frontend (NO incluye contraseña)
class UsuarioResponse(UsuarioBase):
    id: int

    class Config:
        from_attributes = True

# Esquema para cuando el usuario envía sus credenciales (correo y contraseña)
class UsuarioLogin(BaseModel):
    correo: str
    password: str

# Esquema para devolver el Token
class Token(BaseModel):
    access_token: str
    token_type: str