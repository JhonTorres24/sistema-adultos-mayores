from sqlalchemy import Column, Integer, String, Text
from database import Base

class Usuario(Base):
    __tablename__ = "usuarios"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, index=True)
    correo = Column(String, unique=True, index=True)
    password = Column(String) # Aquí irá la contraseña encriptada
    rol = Column(String, default="cuidador") # admin o cuidador

class AdultoMayor(Base):
    __tablename__ = "adultos_mayores"

    id = Column(Integer, primary_key=True, index=True)
    nombre_completo = Column(String, index=True)
    edad = Column(Integer)
    enfermedades = Column(Text, nullable=True)
    familiar_responsable = Column(String)
    telefono_contacto = Column(String)
    direccion = Column(String)

class Visita(Base):
    __tablename__ = "visitas"

    id = Column(Integer, primary_key=True, index=True)
    adulto_id = Column(Integer, index=True) # El ID del adulto mayor al que se visita
    fecha = Column(String) # Guardaremos la fecha como texto por ahora (ej: "2026-11-13")
    observaciones = Column(Text)
    visitado_por = Column(String) # Nombre del cuidador