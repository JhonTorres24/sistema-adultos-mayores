from sqlalchemy.orm import Session
from models import Usuario
from schemas.usuario import UsuarioCreate

def obtener_usuario_por_correo(db: Session, correo: str):
    """Busca un usuario en la base de datos por su correo electrónico."""
    return db.query(Usuario).filter(Usuario.correo == correo).first()

def crear_usuario(db: Session, usuario: UsuarioCreate, password_encriptada: str):
    """Guarda un nuevo usuario en la base de datos."""
    nuevo_usuario = Usuario(
        nombre=usuario.nombre,
        correo=usuario.correo,
        password=password_encriptada,
        rol=usuario.rol
    )
    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario