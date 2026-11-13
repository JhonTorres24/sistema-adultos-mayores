from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.usuario import UsuarioCreate, UsuarioResponse
from services import usuario_service
from fastapi.security import OAuth2PasswordBearer
from schemas.usuario import UsuarioLogin, Token

# Creamos el enrutador (esto se conectará en el main.py)
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

# Función para obtener la sesión de la base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Ruta para registrar un nuevo usuario
@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    nuevo_usuario = usuario_service.registrar_usuario(db, usuario)
    if nuevo_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado en el sistema."
        )
    return nuevo_usuario

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

@router.post("/login", response_model=Token)
def login(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    # 1. Buscamos al usuario por su correo
    usuario = usuario_service.obtener_usuario_por_correo(db, credenciales.correo)
    
    # 2. Si no existe o la contraseña no coincide, lanzamos error
    if not usuario or not usuario_service.verificar_password(credenciales.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    
    # 3. Si todo está bien, creamos el Token
    token = usuario_service.crear_token_acceso(data={"sub": usuario.correo, "rol": usuario.rol})
    
    return {"access_token": token, "token_type": "bearer"}