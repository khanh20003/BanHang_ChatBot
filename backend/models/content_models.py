from sqlalchemy import Column, Integer, String, Text, Float, ForeignKey
from sqlalchemy.orm import relationship
from database.base import Base

class Banner(Base):
    __tablename__ = "banners"
    id = Column(Integer, primary_key=True, index=True)
    image_url = Column(String(500))
    sub_title = Column(String(255))
    title = Column(String(255))
    description = Column(String(500))

class Brand(Base):
    __tablename__ = "brands"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    logo = Column(String(500))

class Recent(Base):
    __tablename__ = "recents"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(String(500))
    image = Column(String(500))
    date = Column(String(50))

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    image = Column(String(500))
    products = relationship("Product", back_populates="category")

class Client(Base):
    __tablename__ = "clients"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    logo = Column(String(500))
    review = Column(Text, nullable=True)

class Delivery(Base):
    __tablename__ = "deliveries"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(String(500))
    icon = Column(String(500))

class Feature(Base):
    __tablename__ = "features"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    description = Column(String(500))
    icon = Column(String(500))

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    price = Column(Float)
    image = Column(String(500))
    short_description = Column(Text)    
    stock = Column(Integer, default=0)
    status = Column(String(50))
    product_type = Column(String(50))  # e.g., 'newest', 'trending', 'best_seller'
    tag = Column(String(50), nullable=True)  # e.g., 'new', 'sale'
    currentPrice = Column(Float, nullable=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=True)
    category = relationship("Category", back_populates="products")