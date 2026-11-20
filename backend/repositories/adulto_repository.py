from sqlalchemy.orm import Session
from models import AdultoMayor, Visita
from schemas.adulto import AdultoMayorCreate
from schemas.adulto import VisitaCreate

def crear_adulto(db: Session, adulto: AdultoMayorCreate):
    """
    Registra un nuevo adulto mayor en la base de datos PostgreSQL.
    Recibe los datos validados por Pydantic y los guarda usando SQLAlchemy.
    """
    nuevo_adulto = AdultoMayor(**adulto.model_dump())
    db.add(nuevo_adulto)
    db.commit()
    db.refresh(nuevo_adulto)
    return nuevo_adulto

def obtener_adultos(db: Session):
    """
    Obtiene la lista completa de adultos mayores desde la base de datos.
    Además, para cada adulto mayor, busca su última visita registrada 
    y la adjunta al objeto para que el Frontend pueda mostrarla en la tabla.
    """
    adultos = db.query(AdultoMayor).all()
    
    # Para cada adulto, buscamos su última visita
    for adulto in adultos:
        ultima_visita = db.query(Visita).filter(Visita.adulto_id == adulto.id).order_by(Visita.fecha.desc()).first()
        if ultima_visita:
            adulto.ultima_visita_fecha = ultima_visita.fecha
            adulto.ultima_visita_por = ultima_visita.visitado_por
        else:
            adulto.ultima_visita_fecha = "Sin visitas"
            adulto.ultima_visita_por = "N/A"
            
    return adultos

def obtener_adulto_por_id(db: Session, adulto_id: int):
    """
    Busca y devuelve un adulto mayor específico utilizando su ID.
    Útil para operaciones de consulta detallada.
    """
    return db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()

def actualizar_adulto(db: Session, adulto_id: int, datos_nuevos: AdultoMayorCreate):
    """
    Actualiza los datos de un adulto mayor existente en la base de datos.
    Incluye la actualización del estado de salud (Estable, Pendiente, Crítico).
    """
    adulto = db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()
    if adulto:
        adulto.nombre_completo = datos_nuevos.nombre_completo
        adulto.edad = datos_nuevos.edad
        adulto.enfermedades = datos_nuevos.enfermedades
        adulto.familiar_responsable = datos_nuevos.familiar_responsable
        adulto.telefono_contacto = datos_nuevos.telefono_contacto
        adulto.direccion = datos_nuevos.direccion
        adulto.estado = datos_nuevos.estado
        db.commit()
        db.refresh(adulto)
    return adulto

def eliminar_adulto(db: Session, adulto_id: int):
    """
    Elimina permanentemente un adulto mayor de la base de datos.
    """
    adulto = db.query(AdultoMayor).filter(AdultoMayor.id == adulto_id).first()
    if adulto:
        db.delete(adulto)
        db.commit()
    return adulto

def crear_visita(db: Session, visita: VisitaCreate):
    """
    Registra una nueva visita asociada a un adulto mayor en la base de datos.
    """
    nueva_visita = Visita(**visita.model_dump())
    db.add(nueva_visita)
    db.commit()
    db.refresh(nueva_visita)
    return nueva_visita

def obtener_visitas_por_adulto(db: Session, adulto_id: int):
    """
    Obtiene el historial completo de visitas de un adulto mayor específico.
    """
    return db.query(Visita).filter(Visita.adulto_id == adulto_id).all()

def contar_todas_las_visitas(db: Session):
    """
    Cuenta el número total de visitas registradas en el sistema.
    Se utiliza para mostrar el resumen en el Dashboard.
    """
    return db.query(Visita).count()