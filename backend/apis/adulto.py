from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from services import adulto_service, usuario_service
from typing import List
# Importación unificada de esquemas para mantener el código limpio
from schemas.adulto import AdultoMayorCreate, AdultoMayorResponse, VisitaCreate, VisitaResponse

# Enrutador para agrupar todas las rutas relacionadas con los Adultos Mayores
router = APIRouter(
    prefix="/adultos",
    tags=["Adultos Mayores"]
)

# Configuración de seguridad: le dice a FastAPI dónde está la ruta de login para obtener el Token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

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

def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    """
    Valida el Token JWT enviado en las cabeceras (Headers).
    Si el token es válido, permite el acceso; si no, lanza un error 401.
    """
    return usuario_service.verificar_token(token)

# --- RUTAS DEL CRUD PARA ADULTOS MAYORES ---

@router.post("/", response_model=AdultoMayorResponse, status_code=status.HTTP_201_CREATED)
def crear_adulto(adulto: AdultoMayorCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para registrar un nuevo adulto mayor. 
    Requiere que el usuario esté autenticado (Token JWT).
    """
    return adulto_service.registrar_adulto(db, adulto)

@router.get("/", response_model=List[AdultoMayorResponse])
def listar_adultos(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para obtener la lista completa de adultos mayores. 
    Requiere autenticación.
    """
    return adulto_service.listar_adultos(db)

@router.put("/{adulto_id}", response_model=AdultoMayorResponse)
def actualizar_adulto(adulto_id: int, adulto: AdultoMayorCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para actualizar los datos de un adulto mayor existente.
    Si el ID no existe, devuelve un error 404.
    """
    resultado = adulto_service.actualizar_adulto(db, adulto_id, adulto)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Adulto mayor no encontrado")
    return resultado

@router.delete("/{adulto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_adulto(adulto_id: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para eliminar un adulto mayor del sistema de forma permanente.
    """
    resultado = adulto_service.eliminar_adulto(db, adulto_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Adulto mayor no encontrado")
    return {"mensaje": "Eliminado correctamente"}

# --- RUTAS PARA EL HISTORIAL DE VISITAS ---

@router.post("/{adulto_id}/visitas", response_model=VisitaResponse, status_code=status.HTTP_201_CREATED)
def crear_visita(adulto_id: int, visita: VisitaCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para registrar una nueva visita.
    Asocia automáticamente la visita al ID del adulto mayor recibido en la URL.
    """
    visita.adulto_id = adulto_id # Forzamos a que sea el ID del adulto
    return adulto_service.registrar_visita(db, visita)

@router.get("/{adulto_id}/visitas", response_model=List[VisitaResponse])
def listar_visitas(adulto_id: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para obtener el historial de visitas de un adulto mayor específico.
    """
    return adulto_service.listar_visitas(db, adulto_id)

@router.get("/visitas/total")
def obtener_total_visitas(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    """
    Ruta para contar el número total de visitas registradas.
    Se utiliza en el Dashboard para mostrar el resumen.
    """
    total = adulto_service.contar_visitas(db)
    return {"total": total}