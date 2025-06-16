from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models

router = APIRouter(prefix="/features", tags=["features"])

@router.get("/", response_model=list[schemas.Feature])
def read_features(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_features(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Feature)
def create_feature(feature: schemas.FeatureCreate, db: Session = Depends(database.get_db)):
    return crud.create_feature(db, feature)

@router.get("/{feature_id}", response_model=schemas.Feature)
def read_feature(feature_id: int, db: Session = Depends(database.get_db)):
    db_feature = crud.get_feature(db, feature_id)
    if db_feature is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return db_feature

@router.put("/{feature_id}", response_model=schemas.Feature)
def update_feature(feature_id: int, feature: schemas.FeatureCreate, db: Session = Depends(database.get_db)):
    db_feature = crud.get_feature(db, feature_id)
    if not db_feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    for key, value in feature.model_dump().items():
        setattr(db_feature, key, value)
    db.commit()
    db.refresh(db_feature)
    return db_feature

@router.delete("/features/{feature_id}")
def delete_feature(feature_id: int, db: Session = Depends(database.get_db)):
    db_feature = crud.get_feature(db, feature_id)
    if not db_feature:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(db_feature)
    db.commit()
    return {"message": "Feature deleted successfully"} 