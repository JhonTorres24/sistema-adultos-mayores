from sqlalchemy.orm import Session
from models import AdultoMayor, Visita
from schemas.adulto import AdultoMayorCreate
from schemas.adulto import VisitaCreate

def crear_adulto(db: Session, adulto: AdultoMayorCreate):
    nuevo_adulto = AdultoMayor(**adulto.model_dump())
    db.add(nuevo_adulto)
    db.commit()
    db.refresh(nuevo_adulto)
    return nuevo_adulto

def obtener_adultos(db: Session):
    return db.query(AdultoMayor).all()

def obtener_adulto_por_id(db: Session, adulto_id: int):
    return db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()

def actualizar_adulto(db: Session, adulto_id: int, datos_nuevos: AdultoMayorCreate):
    adulto = db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()
    if adulto:
        adulto.nombre_completo = datos_nuevos.nombre_completo
        adulto.edad = datos_nuevos.edad
        adulto.enfermedades = datos_nuevos.enfermedades
        adulto.familiar_responsable = datos_nuevos.familiar_responsable
        adulto.telefono_contacto = datos_nuevos.telefono_contacto
        adulto.direccion = datos_nuevos.direccion
        db.commit()
        db.refresh(adulto)
    return adulto

def eliminar_adulto(db: Session, adulto_id: int):
    adulto = db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()
    if adulto:
        db.delete(adulto)
        db.commit()
    return adulto

def crear_visita(db: Session, visita: VisitaCreate):
    nueva_visita = Visita(**visita.model_dump())
    db.add(nueva_visita)
    db.commit()
    db.refresh(nueva_visita)
    return nueva_visita

def obtener_visitas_por_adulto(db: Session, adulto_id: int):
    return db.query(Visita).filter(Visita.adulto_id == adulto_id).all()