from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONEXIÓN A POSTGRESQL ---
# Formato: postgresql://usuario:contraseña@localhost:5432/nombre_base_de_datos
SQLALCHEMY_DATABASE_URL = "postgresql+psycopg2://postgres:admin2408@localhost:5432/adultos_mayores"

# El motor de la base de datos
engine = create_engine(SQLALCHEMY_DATABASE_URL)

# La sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# La base para los modelos
Base = declarative_base()