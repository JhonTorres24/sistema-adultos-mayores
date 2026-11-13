from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import SessionLocal
from schemas.adulto import AdultoMayorCreate, AdultoMayorResponse
from services import adulto_service, usuario_service
from typing import List
from schemas.adulto import AdultoMayorCreate, AdultoMayorResponse, VisitaCreate, VisitaResponse



router = APIRouter(
    prefix="/adultos",
    tags=["Adultos Mayores"]
)

# Esto le dice a FastAPI dónde está la ruta de login para pedir el token
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="usuarios/login")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Nueva función de seguridad: revisa el token antes de dejar pasar
def obtener_usuario_actual(token: str = Depends(oauth2_scheme)):
    return usuario_service.verificar_token(token)

# Ruta para crear un adulto mayor (ahora protegida)
@router.post("/", response_model=AdultoMayorResponse, status_code=status.HTTP_201_CREATED)
def crear_adulto(adulto: AdultoMayorCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    return adulto_service.registrar_adulto(db, adulto)

# Ruta para listar (ahora protegida)
@router.get("/", response_model=List[AdultoMayorResponse])
def listar_adultos(db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    return adulto_service.listar_adultos(db)

# Ruta para actualizar un adulto mayor (PUT)
@router.put("/{adulto_id}", response_model=AdultoMayorResponse)
def actualizar_adulto(adulto_id: int, adulto: AdultoMayorCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    resultado = adulto_service.actualizar_adulto(db, adulto_id, adulto)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Adulto mayor no encontrado")
    return resultado

# Ruta para eliminar un adulto mayor (DELETE)
@router.delete("/{adulto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_adulto(adulto_id: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    resultado = adulto_service.eliminar_adulto(db, adulto_id)
    if resultado is None:
        raise HTTPException(status_code=404, detail="Adulto mayor no encontrado")
    return {"mensaje": "Eliminado correctamente"}

# Ruta para crear una visita
@router.post("/{adulto_id}/visitas", response_model=VisitaResponse, status_code=status.HTTP_201_CREATED)
def crear_visita(adulto_id: int, visita: VisitaCreate, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    visita.adulto_id = adulto_id # Forzamos a que sea el ID del adulto
    return adulto_service.registrar_visita(db, visita)

# Ruta para obtener el historial de visitas de un adulto
@router.get("/{adulto_id}/visitas", response_model=List[VisitaResponse])
def listar_visitas(adulto_id: int, db: Session = Depends(get_db), usuario_actual: dict = Depends(obtener_usuario_actual)):
    return adulto_service.listar_visitas(db, adulto_id)