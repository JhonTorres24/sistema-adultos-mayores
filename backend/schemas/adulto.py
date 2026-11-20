from pydantic import BaseModel
from typing import Optional

class AdultoMayorBase(BaseModel):
    nombre_completo: str
    edad: int
    enfermedades: Optional[str] = None
    familiar_responsable: str
    telefono_contacto: str
    direccion: str
    estado: Optional[str] = "Estable"

class AdultoMayorCreate(AdultoMayorBase):
    pass

class AdultoMayorResponse(AdultoMayorBase):
    id: int
    ultima_visita_fecha: Optional[str] = None
    ultima_visita_por: Optional[str] = None

    class Config:
        from_attributes = True

class VisitaBase(BaseModel):
    adulto_id: int
    fecha: str
    observaciones: str
    visitado_por: str

class VisitaCreate(VisitaBase):
    pass

class VisitaResponse(VisitaBase):
    id: int

    class Config:
        from_attributes = True