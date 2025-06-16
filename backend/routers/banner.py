from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models

router = APIRouter(prefix="/banners", tags=["banners"])

@router.get("/", response_model=list[schemas.Banner])
def read_banners(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_banners(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Banner)
def create_banner(banner: schemas.BannerCreate, db: Session = Depends(database.get_db)):
    return crud.create_banner(db, banner)

@router.get("/{banner_id}", response_model=schemas.Banner)
def read_banner(banner_id: int, db: Session = Depends(database.get_db)):
    db_banner = crud.get_banner(db, banner_id)
    if db_banner is None:
        raise HTTPException(status_code=404, detail="Banner not found")
    return db_banner

@router.put("/{banner_id}", response_model=schemas.Banner)
def update_banner(banner_id: int, banner: schemas.BannerCreate, db: Session = Depends(database.get_db)):
    db_banner = crud.get_banner(db, banner_id)
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    for key, value in banner.model_dump().items():
        setattr(db_banner, key, value)
    db.commit()
    db.refresh(db_banner)
    return db_banner

@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(database.get_db)):
    db_banner = crud.get_banner(db, banner_id)
    if not db_banner:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(db_banner)
    db.commit()
    return {"message": "Banner deleted successfully"} 