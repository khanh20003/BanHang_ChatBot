import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.content_models import Base, Brand, Product

# Đọc DATABASE_URL từ .env
import dotenv
dotenv.load_dotenv()
db_url = os.getenv('DATABASE_URL', 'sqlite:///sql_app.db')
engine = create_engine(db_url)
Session = sessionmaker(bind=engine)
session = Session()

if __name__ == "__main__":
    print(f"[PYTHON EXECUTABLE] {sys.executable}")
    print("==== BRAND LIST ====")
    brands = session.query(Brand).all()
    for b in brands:
        print(f"Brand: id={b.id}, title={b.title}")

    print("\n==== PRODUCT LIST ====")
    products = session.query(Product).all()
    for p in products:
        print(f"Product: id={p.id}, title={p.title}, brand_id={p.brand_id}, status={p.status}, stock={p.stock}")

    # Kiểm tra brand 'Apple' và sản phẩm iPhone
    apple_brand = session.query(Brand).filter(Brand.title.ilike('%apple%')).first()
    if not apple_brand:
        print("[AUTO-FIX] Brand 'Apple' chưa có, sẽ tự động thêm mới.")
        apple_brand = Brand(title='Apple')
        session.add(apple_brand)
        session.commit()
        print(f"[AUTO-FIX] Đã thêm brand 'Apple' với id={apple_brand.id}")
    else:
        print(f"[CHECK] Brand 'Apple' đã tồn tại với id={apple_brand.id}")

    # Tìm sản phẩm iPhone mapping đúng brand_id
    iphone_products = session.query(Product).filter(Product.title.ilike('%iphone%')).all()
    for p in iphone_products:
        if p.brand_id != apple_brand.id:
            print(f"[AUTO-FIX] Sản phẩm '{p.title}' (id={p.id}) mapping sai brand_id ({p.brand_id}), sẽ sửa lại thành {apple_brand.id}")
            p.brand_id = apple_brand.id
            p.status = 'active'
            p.stock = max(p.stock, 1)
    session.commit()

    # Kiểm tra lại
    print("\n==== SAU KHI FIX ====")
    brands = session.query(Brand).all()
    for b in brands:
        print(f"Brand: id={b.id}, title={b.title}")
    products = session.query(Product).filter(Product.title.ilike('%iphone%')).all()
    for p in products:
        print(f"Product: id={p.id}, title={p.title}, brand_id={p.brand_id}, status={p.status}, stock={p.stock}")

    print("[DONE] Đã kiểm tra và tự động sửa seed/mapping brand_id cho sản phẩm iPhone!")
