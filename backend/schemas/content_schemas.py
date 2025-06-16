from pydantic import BaseModel
from typing import Optional

class BannerSchema(BaseModel):
    id: Optional[int] = None
    image_url: str
    sub_title: str
    title: str
    description: str
    class Config:
        from_attributes = True

class BrandSchema(BaseModel):
    id: Optional[int] = None
    title: str
    logo: str
    class Config:
        from_attributes = True

class RecentSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    image: str
    date: str
    class Config:
        from_attributes = True

class SectionTitleData(BaseModel):
    title: str
    subTitle: str

class CategorySchema(BaseModel):
    id: Optional[int] = None
    title: str
    image: str
    class Config:
        from_attributes = True

class ClientSchema(BaseModel):
    id: Optional[int] = None
    title: str
    logo: str
    review: Optional[str] = None
    class Config:
        from_attributes = True

class DeliverySchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    icon: str
    class Config:
        from_attributes = True

class FeatureSchema(BaseModel):
    id: Optional[int] = None
    title: str
    description: str
    icon: str
    class Config:
        from_attributes = True

class ProductSchema(BaseModel):
    id: Optional[int] = None
    title: str
    price: float
    image: str
    description: Optional[str] = None
    rating: Optional[float] = 0.0
    stock: Optional[int] = 0
    status: Optional[str] = None
    current_price: Optional[float] = None
    category: Optional[str] = None
    class Config:
        from_attributes = True