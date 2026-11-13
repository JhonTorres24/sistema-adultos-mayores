from sqlalchemy.orm import Session
from schemas.adulto import AdultoMayorCreate
from repositories import adulto_repository
from schemas.adulto import VisitaCreate

def registrar_adulto(db: Session, adulto: AdultoMayorCreate):
    return adulto_repository.crear_adulto(db, adulto)

def listar_adultos(db: Session):
    return adulto_repository.obtener_adultos(db)

def buscar_adulto(db: Session, adulto_id: int):
    return adulto_repository.obtener_adulto_por_id(db, adulto_id)

# --- NUEVAS FUNCIONES ---
def actualizar_adulto(db: Session, adulto_id: int, datos_nuevos: AdultoMayorCreate):
    return adulto_repository.actualizar_adulto(db, adulto_id, datos_nuevos)

def eliminar_adulto(db: Session, adulto_id: int):
    return adulto_repository.eliminar_adulto(db, adulto_id)

def registrar_visita(db: Session, visita: VisitaCreate):
    return adulto_repository.crear_visita(db, visita)

def listar_visitas(db: Session, adulto_id: int):
    return adulto_repository.obtener_visitas_por_adulto(db, adulto_id)