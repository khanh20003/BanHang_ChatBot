import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.content_models import Product, Category
from database.database import SessionLocal
from sqlalchemy.orm import Session

def check_data():
    db: Session = SessionLocal()
    try:
        product_count = db.query(Product).count()
        category_count = db.query(Category).count()
        print(f"Số lượng sản phẩm trong bảng products: {product_count}")
        print(f"Số lượng danh mục trong bảng categories: {category_count}")
        if product_count > 0:
            print("Một số sản phẩm đầu tiên:")
            for p in db.query(Product).limit(5):
                print(f"- {p.id}: {p.title}")
        if category_count > 0:
            print("Danh mục có trong bảng:")
            for c in db.query(Category).limit(5):
                print(f"- {c.id}: {c.name}")
    finally:
        db.close()

if __name__ == "__main__":
    check_data()
