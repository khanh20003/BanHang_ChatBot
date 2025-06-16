from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models

router = APIRouter(prefix="/recents", tags=["recents"])

@router.get("/", response_model=list[schemas.Recent])
def read_recents(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_recents(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Recent)
def create_recent(recent: schemas.RecentCreate, db: Session = Depends(database.get_db)):
    return crud.create_recent(db, recent)

@router.get("/{recent_id}", response_model=schemas.Recent)
def read_recent(recent_id: int, db: Session = Depends(database.get_db)):
    db_recent = crud.get_recent(db, recent_id)
    if db_recent is None:
        raise HTTPException(status_code=404, detail="Recent not found")
    return db_recent

@router.put("/{recent_id}", response_model=schemas.Recent)
def update_recent(recent_id: int, recent: schemas.RecentCreate, db: Session = Depends(database.get_db)):
    db_recent = crud.get_recent(db, recent_id)
    if not db_recent:
        raise HTTPException(status_code=404, detail="Recent not found")
    for key, value in recent.model_dump().items():
        setattr(db_recent, key, value)
    db.commit()
    db.refresh(db_recent)
    return db_recent

@router.delete("/recents/{recent_id}")
def delete_recent(recent_id: int, db: Session = Depends(database.get_db)):
    db_recent = crud.get_recent(db, recent_id)
    if not db_recent:
        raise HTTPException(status_code=404, detail="Recent not found")
    db.delete(db_recent)
    db.commit()
    return {"message": "Recent deleted successfully"} 