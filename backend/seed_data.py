from sqlalchemy.orm import Session
from module.database import SessionLocal
from module import models, schemas
from datetime import datetime

def seed_data():
    db = SessionLocal()

    # Dữ liệu mẫu đa dạng
    products = [
        {
            "title": "iPhone 16 Flash Sale",
            "image": "iphone16-flash.jpg",
            "price": 1099.0,
            "currentPrice": 999.0,
            "status": "active",
            "product_type": "flash_sale",
            "stock": 10,
            "category_id": 1,
            "tag": "flash,sale",
            "short_description": "iPhone 16 giảm giá sốc!"
        },
        {
            "title": "OPPO Find X8",
            "image": "oppo-x8.jpg",
            "price": 899.0,
            "currentPrice": 829.0,
            "status": "active",
            "product_type": "newest",
            "stock": 5,
            "category_id": 1,
            "tag": "new",
            "short_description": "OPPO Find X8 mới ra mắt."
        },
        {
            "title": "Samsung Galaxy S24",
            "image": "s24.jpg",
            "price": 999.0,
            "currentPrice": 949.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 8,
            "category_id": 1,
            "tag": "sale",
            "short_description": "Samsung S24 bán chạy nhất."
        },
        {
            "title": "Vivo X200",
            "image": "vivo-x200.jpg",
            "price": 799.0,
            "currentPrice": 749.0,
            "status": "active",
            "product_type": "trending",
            "stock": 7,
            "category_id": 1,
            "tag": "hot",
            "short_description": "Vivo X200 hot trend."
        },
        {
            "title": "Lenovo IdeaPad 3",
            "image": "lenovo-ideapad3.jpg",
            "price": 399.0,
            "currentPrice": 379.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 12,
            "category_id": 2,
            "tag": "sale",
            "short_description": "Laptop giá rẻ bán chạy."
        },
        {
            "title": "MacBook Air M2",
            "image": "macbook-air-m2.jpg",
            "price": 1299.0,
            "currentPrice": 1249.0,
            "status": "active",
            "product_type": "newest",
            "stock": 6,
            "category_id": 2,
            "tag": "new",
            "short_description": "MacBook Air M2 mới nhất."
        }
    ]

    # Add products
    for product_data in products:
        db_product = models.Product(**product_data)
        db.add(db_product)

    try:
        db.commit()
        print("Sample data added successfully!")
    except Exception as e:
        print(f"Error adding sample data: {e}")
        db.rollback()
    finally:
        db.close()

def create_default_admin(db: Session):
    from module import crud, schemas
    admin = schemas.AdminCreate(
        email="admin@example.com",
        password="admin123",
        name="Admin User"
    )
    print("create_default_admin: creating admin (email: {}, password: {}, name: {})".format(admin.email, admin.password, admin.name))
    try:
        crud.create_admin(db, admin)
        print("create_default_admin: admin created (email: {})".format(admin.email))
    except Exception as e:
        print("create_default_admin: error ––", e)

if __name__ == "__main__":
    db = SessionLocal()
    try:
        seed_data()
        create_default_admin(db)
    finally:
        db.close()