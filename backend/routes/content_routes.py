from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database.database import get_db
from models.content_models import Banner, Brand, Recent, Category, Client, Delivery, Feature, Product
from schemas.content_schemas import (
    BannerSchema, BrandSchema, RecentSchema, SectionTitleData,
    CategorySchema, ClientSchema, DeliverySchema, FeatureSchema, ProductSchema
)

router = APIRouter()

# Banner routes
@router.get("/banners", response_model=List[BannerSchema])
def get_banners(db: Session = Depends(get_db)):
    return db.query(Banner).all()

@router.post("/banners", response_model=BannerSchema)
def create_banner(banner: BannerSchema, db: Session = Depends(get_db)):
    obj = Banner(**banner.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/banners/{banner_id}")
def delete_banner(banner_id: int, db: Session = Depends(get_db)):
    obj = db.query(Banner).filter(Banner.id == banner_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Banner not found")
    db.delete(obj)
    db.commit()
    return {"message": "Banner deleted"}

# Brand routes
@router.get("/brands", response_model=List[BrandSchema])
def get_brands(db: Session = Depends(get_db)):
    return db.query(Brand).all()

@router.post("/brands", response_model=BrandSchema)
def create_brand(brand: BrandSchema, db: Session = Depends(get_db)):
    obj = Brand(**brand.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/brands/{brand_id}")
def delete_brand(brand_id: int, db: Session = Depends(get_db)):
    obj = db.query(Brand).filter(Brand.id == brand_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Brand not found")
    db.delete(obj)
    db.commit()
    return {"message": "Brand deleted"}

# Recent routes
@router.get("/recents", response_model=List[RecentSchema])
def get_recents(db: Session = Depends(get_db)):
    return db.query(Recent).all()

@router.post("/recents", response_model=RecentSchema)
def create_recent(recent: RecentSchema, db: Session = Depends(get_db)):
    obj = Recent(**recent.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/recents/{recent_id}", response_model=RecentSchema)
def update_recent(recent_id: int, updated_recent: RecentSchema, db: Session = Depends(get_db)):
    obj = db.query(Recent).filter(Recent.id == recent_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Recent item not found")
    for k, v in updated_recent.dict().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/recents/{recent_id}")
def delete_recent(recent_id: int, db: Session = Depends(get_db)):
    obj = db.query(Recent).filter(Recent.id == recent_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Recent item not found")
    db.delete(obj)
    db.commit()
    return {"message": "Recent item deleted"}

# Category routes
@router.get("/categories", response_model=List[CategorySchema])
def get_categories(db: Session = Depends(get_db)):
    return db.query(Category).all()

@router.post("/categories", response_model=CategorySchema)
def create_category(category: CategorySchema, db: Session = Depends(get_db)):
    obj = Category(**category.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/categories/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    obj = db.query(Category).filter(Category.id == category_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Category not found")
    db.delete(obj)
    db.commit()
    return {"message": "Category deleted"}

# Client routes
@router.get("/clients", response_model=List[ClientSchema])
def get_clients(db: Session = Depends(get_db)):
    return db.query(Client).all()

@router.post("/clients", response_model=ClientSchema)
def create_client(client: ClientSchema, db: Session = Depends(get_db)):
    obj = Client(**client.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/clients/{client_id}")
def delete_client(client_id: int, db: Session = Depends(get_db)):
    obj = db.query(Client).filter(Client.id == client_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Client not found")
    db.delete(obj)
    db.commit()
    return {"message": "Client deleted"}

# Delivery routes
@router.get("/deliveries", response_model=List[DeliverySchema])
def get_deliveries(db: Session = Depends(get_db)):
    return db.query(Delivery).all()

@router.post("/deliveries", response_model=DeliverySchema)
def create_delivery(delivery: DeliverySchema, db: Session = Depends(get_db)):
    obj = Delivery(**delivery.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/deliveries/{delivery_id}")
def delete_delivery(delivery_id: int, db: Session = Depends(get_db)):
    obj = db.query(Delivery).filter(Delivery.id == delivery_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Delivery not found")
    db.delete(obj)
    db.commit()
    return {"message": "Delivery deleted"}

# Feature routes
@router.get("/features", response_model=List[FeatureSchema])
def get_features(db: Session = Depends(get_db)):
    return db.query(Feature).all()

@router.post("/features", response_model=FeatureSchema)
def create_feature(feature: FeatureSchema, db: Session = Depends(get_db)):
    obj = Feature(**feature.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/features/{feature_id}")
def delete_feature(feature_id: int, db: Session = Depends(get_db)):
    obj = db.query(Feature).filter(Feature.id == feature_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Feature not found")
    db.delete(obj)
    db.commit()
    return {"message": "Feature deleted"}

# Product routes
@router.get("/products", response_model=List[ProductSchema])
def get_products(db: Session = Depends(get_db)):
    return db.query(Product).all()

@router.post("/products", response_model=ProductSchema)
def create_product(product: ProductSchema, db: Session = Depends(get_db)):
    obj = Product(**product.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj

@router.put("/products/{product_id}", response_model=ProductSchema)
def update_product(product_id: int, updated_product: ProductSchema, db: Session = Depends(get_db)):
    obj = db.query(Product).filter(Product.id == product_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    for k, v in updated_product.dict().items():
        setattr(obj, k, v)
    db.commit()
    db.refresh(obj)
    return obj

@router.delete("/products/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db)):
    obj = db.query(Product).filter(Product.id == product_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Product not found")
    db.delete(obj)
    db.commit()
    return {"message": "Product deleted"}

# Section title route
@router.get("/section-title", response_model=SectionTitleData)
def get_section_title():
    return SectionTitleData(
        title="Best Furniture Collection for Your Interior",
        subTitle="Welcome to Chairs"
    )