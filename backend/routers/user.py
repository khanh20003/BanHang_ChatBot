from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from module.database import get_db
from module import crud, schemas

router = APIRouter(prefix="/user", tags=["user"])

@router.get("/list", response_model=list[schemas.UserResponse])
def get_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users
