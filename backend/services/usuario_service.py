from sqlalchemy.orm import Session
from passlib.context import CryptContext
from schemas.usuario import UsuarioCreate
from repositories import usuario_repository
from datetime import datetime, timedelta
from jose import jwt
from jose import JWTError, jwt
from fastapi import HTTPException, status 

# Configuramos el encriptador de contraseñas
pwd_context = CryptContext(schemes=["bcrypt_sha256"], deprecated="auto")

def obtener_usuario_por_correo(db: Session, correo: str):
    return usuario_repository.obtener_usuario_por_correo(db, correo)

def registrar_usuario(db: Session, usuario: UsuarioCreate):
    # 1. Verificar si el correo ya existe
    usuario_existente = usuario_repository.obtener_usuario_por_correo(db, usuario.correo)
    if usuario_existente:
        return None # Retorna None si el correo ya está en uso

    # 2. Encriptar la contraseña (por seguridad, nunca se guarda en texto plano)
    password_encriptada = pwd_context.hash(usuario.password)

    # 3. Guardar en la base de datos usando el repositorio
    nuevo_usuario = usuario_repository.crear_usuario(
        db=db, 
        usuario=usuario, 
        password_encriptada=password_encriptada
    )
    return nuevo_usuario

def verificar_password(password_plana: str, password_encriptada: str):
    # Compara la contraseña que escribe el usuario con la encriptada en la BD
    return pwd_context.verify(password_plana, password_encriptada)

SECRET_KEY = "mi_clave_secreta_super_segura_123"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

def crear_token_acceso(data: dict):
    """Genera un Token JWT con los datos del usuario y un tiempo de expiración."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
def verificar_token(token: str):
    """Verifica si el token es válido y devuelve los datos del usuario."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        correo: str = payload.get("sub")
        if correo is None:
            raise HTTPException(status_code=401, detail="Token inválido")
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No se pudo validar el token de acceso",
            headers={"WWW-Authenticate": "Bearer"},
        )