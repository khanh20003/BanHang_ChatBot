from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Request
from sqlalchemy.orm import Session
from module import crud, schemas, database, models
import logging
from typing import Optional

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/products", tags=["products"])

def append_color_to_description(product):
    # Nếu có trường color và color khác None/rỗng, ghép vào mô tả
    if hasattr(product, 'color') and product.color:
        desc = getattr(product, 'description', None) or getattr(product, 'short_description', '')
        color_text = f" Màu sắc: {product.color}"
        # Nếu chưa có color trong mô tả thì ghép vào
        if desc and color_text.strip() not in desc:
            return desc.strip() + color_text
        elif not desc:
            return color_text.strip()
        else:
            return desc
    else:
        desc = getattr(product, 'description', None) or getattr(product, 'short_description', '')
        return desc

@router.get("/")
async def read_products(
    request: Request,
    skip: int = 0,
    limit: int = 100,
    product_type: str | None = None,
    category_id: int | None = None,
    search: str | None = None,
    status: str | None = None,
    db: Session = Depends(database.get_db)
):
    try:
        # Xây dựng query cơ bản
        query = db.query(models.Product)
        
        # Lọc theo status
        if status:
            query = query.filter(models.Product.status == status)
        
        # Lọc theo product_type
        if product_type and product_type != 'all':
            query = query.filter(models.Product.product_type == product_type)
        
        # Lọc theo category_id
        if category_id:
            query = query.filter(models.Product.category_id == category_id)
        
        # Tìm kiếm theo title
        if search:
            search_term = f"%{search}%"
            query = query.filter(models.Product.title.ilike(search_term))
        
        # Lấy tổng số sản phẩm (sau khi lọc)
        total_products = query.count()
        
        # Áp dụng phân trang và sắp xếp
        products = query.order_by(models.Product.id).offset(skip).limit(limit).all()
        
        # Xử lý đường dẫn ảnh
        for p in products:
            if p.image and not p.image.startswith("http"):
                p.image = str(request.base_url).rstrip("/") + "/" + p.image.lstrip("/")
        
        return {
            "products": products,
            "total_products": total_products
        }
    except Exception as e:
        logger.error(f"Error fetching products: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error fetching products: {str(e)}")

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
async def create_product(
    title: str = Form(...),
    price: float = Form(...),
    currentPrice: Optional[float] = Form(None),
    status: str = Form(...),
    product_type: Optional[str] = Form(None),
    tag: Optional[str] = Form(None),
    short_description: Optional[str] = Form(None),
    stock: int = Form(...),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    db: Session = Depends(database.get_db)
):
    image_path = None
    if image:
        image_path = f"static/images/products/{image.filename}"
        with open(image_path, "wb") as f:
            f.write(await image.read())
    product_data = {
        "title": title,
        "price": price,
        "currentPrice": currentPrice,
        "status": status,
        "product_type": product_type,
        "tag": tag,
        "short_description": short_description,
        "stock": stock,
        "category_id": category_id,
        "image": image_path,
    }
    return crud.create_product(db, product_data)

@router.get("/{product_id}", response_model=schemas.Product)
def read_product(product_id: int, request: Request, db: Session = Depends(database.get_db)):
    db_product = crud.get_product(db, product_id)
    if db_product is None:
        raise HTTPException(status_code=404, detail="Product not found")
    if db_product.image and not db_product.image.startswith("http"):
        db_product.image = str(request.base_url).rstrip("/") + "/" + db_product.image.lstrip("/")
    return db_product

@router.put("/{product_id}", response_model=schemas.Product)
async def update_product(
    product_id: int,
    title: str = Form(...),
    price: float = Form(...),
    currentPrice: Optional[float] = Form(None),
    status: str = Form(...),
    stock: int = Form(...),
    short_description: str = Form(None),
    category_id: int = Form(...),
    image: UploadFile = File(None),
    tag: str = Form(None),
    product_type: str = Form(None),
    db: Session = Depends(database.get_db)
):
    db_product = crud.get_product(db, product_id)
    if not db_product:
        raise HTTPException(status_code=404, detail="Product not found")
    if image:
        image_path = f"static/images/products/{image.filename}"
        with open(image_path, "wb") as f:
            f.write(await image.read())
        db_product.image = image_path
    db_product.title = title
    db_product.currentPrice = currentPrice
    db_product.status = status
    db_product.stock = stock
    db_product.price = price
    db_product.short_description = short_description
    db_product.category_id = category_id
    db_product.tag = tag
    db_product.product_type = product_type
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