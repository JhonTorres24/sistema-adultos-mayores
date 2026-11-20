from sqlalchemy.orm import Session
from schemas.adulto import AdultoMayorCreate
from repositories import adulto_repository
from schemas.adulto import VisitaCreate

def registrar_adulto(db: Session, adulto: AdultoMayorCreate):
    """
    Gestiona la lógica para registrar un nuevo adulto mayor.
    Delega la creación al repositorio.
    """
    return adulto_repository.crear_adulto(db, adulto)

def listar_adultos(db: Session):
    """
    Solicita al repositorio la lista completa de adultos mayores registrados.
    """
    return adulto_repository.obtener_adultos(db)

def buscar_adulto(db: Session, adulto_id: int):
    """
    Busca un adulto mayor específico por su ID.
    """
    return adulto_repository.obtener_adulto_por_id(db, adulto_id)

# --- FUNCIONES DE ACTUALIZACIÓN Y ELIMINACIÓN ---

def actualizar_adulto(db: Session, adulto_id: int, datos_nuevos: AdultoMayorCreate):
    """
    Gestiona la actualización de los datos de un adulto mayor.
    Delega la modificación al repositorio.
    """
    return adulto_repository.actualizar_adulto(db, adulto_id, datos_nuevos)

def eliminar_adulto(db: Session, adulto_id: int):
    """
    Gestiona la eliminación de un adulto mayor del sistema.
    """
    return adulto_repository.eliminar_adulto(db, adulto_id)

# --- FUNCIONES PARA LAS VISITAS ---

def registrar_visita(db: Session, visita: VisitaCreate):
    """
    Registra una nueva visita en el historial de un adulto mayor.
    """
    return adulto_repository.crear_visita(db, visita)

def listar_visitas(db: Session, adulto_id: int):
    """
    Obtiene el historial de visitas de un adulto mayor específico.
    """
    return adulto_repository.obtener_visitas_por_adulto(db, adulto_id)

def contar_visitas(db: Session):
    """
    Obtiene el total de visitas registradas en el sistema.
    Se usa para mostrar el número en el Dashboard.
    """
    return adulto_repository.contar_todas_las_visitas(db)