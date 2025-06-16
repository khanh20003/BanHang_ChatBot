from sqlalchemy.orm import Session
from module.database import SessionLocal
from module import models, schemas
from datetime import datetime

def seed_data():
    db = SessionLocal()
    
    
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