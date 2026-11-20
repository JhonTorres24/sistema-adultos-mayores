from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import SessionLocal
from services import usuario_service
from fastapi.security import OAuth2PasswordBearer
# Importación unificada de esquemas para mantener el código limpio
from schemas.usuario import UsuarioCreate, UsuarioResponse, UsuarioLogin, Token

# Enrutador para agrupar todas las rutas relacionadas con los Usuarios
router = APIRouter(
    prefix="/usuarios",
    tags=["Usuarios"]
)

def get_db():
    """
    Abre una conexión a la base de datos para la petición actual.
    Se asegura de cerrarla al finalizar, incluso si hay errores.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Configuración de seguridad para obtener el Token en la ruta de Login
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

@router.post("/registro", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
def registrar_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    """
    Ruta para registrar un nuevo usuario en el sistema (Administrador o Cuidador).
    Verifica que el correo electrónico no esté ya registrado en la base de datos.
    """
    nuevo_usuario = usuario_service.registrar_usuario(db, usuario)
    if nuevo_usuario is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El correo ya está registrado en el sistema."
        )
    return nuevo_usuario

@router.post("/login", response_model=Token)
def login(credenciales: UsuarioLogin, db: Session = Depends(get_db)):
    """
    Ruta de autenticación (Login).
    Valida el correo y la contraseña. Si son correctos, genera y devuelve un Token JWT
    que el Frontend debe usar para acceder a las rutas protegidas.
    """
    # 1. Buscamos al usuario por su correo
    usuario = usuario_service.obtener_usuario_por_correo(db, credenciales.correo)
    
    # 2. Si no existe o la contraseña no coincide, lanzamos error
    if not usuario or not usuario_service.verificar_password(credenciales.password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Correo o contraseña incorrectos"
        )
    
    # 3. Si todo está bien, creamos el Token con el correo y el rol del usuario
    token = usuario_service.crear_token_acceso(data={"sub": usuario.correo, "rol": usuario.rol})
    
    return {"access_token": token, "token_type": "bearer"}