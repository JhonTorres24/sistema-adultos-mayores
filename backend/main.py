"""
=============================================================================
SISTEMA DE REGISTRO Y SEGUIMIENTO DE ADULTOS MAYORES - HUANCAYO
Autor Principal: Jhon Torres Escalante
Descripción: Punto de entrada principal de la API (FastAPI).
Tecnologías: FastAPI, SQLAlchemy, PostgreSQL, JWT.
=============================================================================
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine
import models
from apis import usuario, adulto

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="API Sistema de Adultos Mayores")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def inicio():
    return {"mensaje": "¡Bienvenido al Backend!"}

app.include_router(usuario.router) # <-- Nueva línea
app.include_router(adulto.router)