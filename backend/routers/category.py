from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from module import crud, schemas, database, models
import shutil
import os

router = APIRouter(prefix="/categories", tags=["categories"])

@router.get("/", response_model=list[schemas.Category])
def read_categories(skip: int = 0, limit: int = 100, db: Session = Depends(database.get_db)):
    return crud.get_categories(db, skip=skip, limit=limit)

@router.post("/", response_model=schemas.Category)
async def create_category(
    name: str = Form(...),
    products: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    image_url = ""
    if image:
        save_dir = "static/images/categories"
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, image.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = "/" + save_path.replace("\\", "/")
    category_data = {
        "name": name,
        "products": products,
        "image": image_url
    }
    return crud.create_category(db=db, category=schemas.CategoryCreate(**category_data))

@router.get("/{category_id}", response_model=schemas.Category)
def read_category(category_id: int, db: Session = Depends(database.get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    return db_category

@router.put("/{category_id}", response_model=schemas.Category)
async def update_category(
    category_id: int,
    name: str = Form(...),
    products: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    image_url = db_category.image
    if image:
        save_dir = "static/images/categories"
        os.makedirs(save_dir, exist_ok=True)
        save_path = os.path.join(save_dir, image.filename)
        with open(save_path, "wb") as buffer:
            shutil.copyfileobj(image.file, buffer)
        image_url = "/" + save_path.replace("\\", "/")
    db_category.name = name
    db_category.products = products
    db_category.image = image_url
    db.commit()
    db.refresh(db_category)
    return db_category

@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(database.get_db)):
    db_category = crud.get_category(db, category_id=category_id)
    if db_category is None:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(db_category)
    db.commit()
    return {"message": "Category deleted successfully"}