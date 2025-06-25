from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

# Load biến môi trường từ file .env nếu có
load_dotenv()

# Lấy DATABASE_URL từ biến môi trường, ưu tiên SQLite nếu không có
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///sql_app.db")

engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
