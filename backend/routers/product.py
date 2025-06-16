from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from module import crud, schemas, database, models
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])

@router.get("/", response_model=list[schemas.Product])
def read_products(
    skip: int = 0, 
    limit: int = 100, 
    product_type: str = None,
    category_id: int = None,
    db: Session = Depends(database.get_db)
):
    try:
        logger.info(f"Fetching products with filters: product_type={product_type}, category_id={category_id}")
        
        if product_type:
            products = crud.get_products_by_type(db, product_type, skip=skip, limit=limit)
            logger.info(f"Found {len(products)} products with type {product_type}")
            return products
        elif category_id:
            products = crud.get_products_by_category(db, category_id, skip=skip, limit=limit)
            logger.info(f"Found {len(products)} products in category {category_id}")
            return products
        
        products = crud.get_products(db, skip=skip, limit=limit)
        logger.info(f"Found {len(products)} products without filters")
        return products
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/category/{category_id}", response_model=list[schemas.Product])
def get_products_by_category(
    category_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(database.get_db)
):
    try:
        logger.info(f"Fetching products for category {category_id}")
        products = crud.get_products_by_category(db, category_id, skip=skip, limit=limit)
        logger.info(f"Found {len(products)} products in category {category_id}")
        return products
    except Exception as e:
        logger.error(f"Error fetching category products: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/", response_model=schemas.Product)
def create_product(product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    return crud.create_product(db, product)

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
def update_product(product_id: int, product: schemas.ProductCreate, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    for key, value in product.model_dump().items():
        setattr(db_product, key, value)
    db.commit()
    db.refresh(db_product)
    return db_product

@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(db_product)
    db.commit()
    return {"message": "Product deleted successfully"} 