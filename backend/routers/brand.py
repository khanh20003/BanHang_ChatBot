from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models

router = APIRouter(prefix="/brands", tags=["brands"])

@router.get("/", response_model=list[schemas.Brand])
def read_brands(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_brands(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Brand)
def create_brand(brand: schemas.BrandCreate, db: Session = Depends(database.get_db)):
    return crud.create_brand(db, brand)

@router.get("/{brand_id}", response_model=schemas.Brand)
def read_brand(brand_id: int, db: Session = Depends(database.get_db)):
    db_brand = crud.get_brand(db, brand_id)
    if db_brand is None:
        raise HTTPException(status_code=404, detail="Brand not found")
    return db_brand

@router.put("/{brand_id}", response_model=schemas.Brand)
def update_brand(brand_id: int, brand: schemas.BrandCreate, db: Session = Depends(database.get_db)):
    db_brand = crud.get_brand(db, brand_id)
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    for key, value in brand.model_dump().items():
        setattr(db_brand, key, value)
    db.commit()
    db.refresh(db_brand)
    return db_brand

@router.delete("/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(database.get_db)):
    db_brand = crud.get_brand(db, brand_id)
    if not db_brand:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(db_brand)
    db.commit()
    return {"message": "Brand deleted successfully"} 