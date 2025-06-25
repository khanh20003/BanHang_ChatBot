from sqlalchemy.orm import Session
from module.database import SessionLocal
from module import models, schemas
from datetime import datetime
import random

def seed_data():
    db = SessionLocal()

    # Seed danh mục trước
    categories = [
        {"id": 1, "title": "điện thoại", "image": "dienthoai.jpg"},
        {"id": 2, "title": "laptop", "image": "laptop.jpg"},
        {"id": 3, "title": "máy tính bảng", "image": "tablet.jpg"},
        {"id": 4, "title": "tai nghe", "image": "tainghe.jpg"},
        {"id": 5, "title": "phụ kiện", "image": "phukien.jpg"},
    ]
    for cat in categories:
        exists = db.query(models.Category).filter_by(id=cat["id"]).first()
        if not exists:
            db.add(models.Category(**cat))
    db.commit()

    # Dữ liệu mẫu đa dạng
    products = [
        # Điện thoại
        {
            "title": "iPhone 16 Pro Max",
            "image": "iphone16promax.jpg",
            "price": 1399.0,
            "currentPrice": 1299.0,
            "status": "active",
            "product_type": "newest",
            "stock": 15,
            "category_id": 1,
            "tag": "new",
            "short_description": "iPhone 16 Pro Max mới nhất, camera 5 ống kính."
        },
        {
            "title": "Samsung Galaxy S24 Ultra",
            "image": "galaxy-s24-ultra.jpg",
            "price": 1199.0,
            "currentPrice": 1149.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 20,
            "category_id": 1,
            "tag": "sale",
            "short_description": "Samsung Galaxy S24 Ultra flagship 2025."
        },
        {
            "title": "OPPO Find X8 Pro",
            "image": "oppo-find-x8-pro.jpg",
            "price": 899.0,
            "currentPrice": 849.0,
            "status": "active",
            "product_type": "trending",
            "stock": 18,
            "category_id": 1,
            "tag": "hot",
            "short_description": "OPPO Find X8 Pro pin trâu, sạc siêu nhanh."
        },
        {
            "title": "Xiaomi 14 Ultra Flash Sale",
            "image": "xiaomi-14-ultra-flashsale.jpg",
            "price": 999.0,
            "currentPrice": 799.0,
            "status": "active",
            "product_type": "flash_sale",
            "stock": 10,
            "category_id": 1,
            "tag": "flash",
            "short_description": "Xiaomi 14 Ultra giảm giá sốc chỉ hôm nay."
        },
        {
            "title": "Samsung Galaxy S24",
            "image": "galaxy-s24.jpg",
            "price": 899.0,
            "currentPrice": 849.0,
            "status": "active",
            "product_type": "trending",
            "stock": 25,
            "category_id": 1,
            "tag": "hot",
            "short_description": "Samsung Galaxy S24 bản tiêu chuẩn, pin trâu, camera AI." 
        },
        {
            "title": "Samsung Galaxy S24 FE",
            "image": "galaxy-s24-fe.jpg",
            "price": 799.0,
            "currentPrice": 749.0,
            "status": "active",
            "product_type": "flash_sale",
            "stock": 30,
            "category_id": 1,
            "tag": "flash",
            "short_description": "Samsung Galaxy S24 FE giá tốt, màn hình lớn, pin khoẻ." 
        },
        {
            "title": "Samsung Galaxy S23 Ultra",
            "image": "galaxy-s23-ultra.jpg",
            "price": 999.0,
            "currentPrice": 899.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 15,
            "category_id": 1,
            "tag": "sale",
            "short_description": "Samsung Galaxy S23 Ultra flagship 2024, camera 200MP." 
        },
        {
            "title": "Samsung Galaxy A55 5G",
            "image": "galaxy-a55-5g.jpg",
            "price": 499.0,
            "currentPrice": 449.0,
            "status": "active",
            "product_type": "newest",
            "stock": 40,
            "category_id": 1,
            "tag": "new",
            "short_description": "Samsung Galaxy A55 5G giá rẻ, pin khoẻ, màn hình 120Hz." 
        },
        # Laptop
        {
            "title": "MacBook Air M3",
            "image": "macbook-air-m3.jpg",
            "price": 1299.0,
            "currentPrice": 1249.0,
            "status": "active",
            "product_type": "newest",
            "stock": 10,
            "category_id": 2,
            "tag": "new",
            "short_description": "MacBook Air M3 siêu nhẹ, pin 20 tiếng."
        },
        {
            "title": "Dell XPS 13 Plus",
            "image": "dell-xps-13-plus.jpg",
            "price": 1499.0,
            "currentPrice": 1399.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 8,
            "category_id": 2,
            "tag": "sale",
            "short_description": "Dell XPS 13 Plus màn OLED, cảm ứng."
        },
        {
            "title": "ASUS ZenBook 14 OLED Flash Sale",
            "image": "asus-zenbook-14-flashsale.jpg",
            "price": 1299.0,
            "currentPrice": 999.0,
            "status": "active",
            "product_type": "flash_sale",
            "stock": 5,
            "category_id": 2,
            "tag": "flash",
            "short_description": "ASUS ZenBook 14 OLED giá cực sốc, số lượng có hạn."
        },
        # Máy tính bảng
        {
            "title": "iPad Pro M4 2025",
            "image": "ipad-pro-m4.jpg",
            "price": 1199.0,
            "currentPrice": 1149.0,
            "status": "active",
            "product_type": "newest",
            "stock": 12,
            "category_id": 3,
            "tag": "new",
            "short_description": "iPad Pro M4 2025 màn hình XDR, chip M4."
        },
        # Tai nghe
        {
            "title": "Sony WH-1000XM6",
            "image": "sony-wh1000xm6.jpg",
            "price": 499.0,
            "currentPrice": 449.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 25,
            "category_id": 4,
            "tag": "sale",
            "short_description": "Tai nghe chống ồn Sony WH-1000XM6."
        },
        # Phụ kiện
        {
            "title": "Sạc nhanh Anker Nano II 65W",
            "image": "anker-nano2-65w.jpg",
            "price": 59.0,
            "currentPrice": 49.0,
            "status": "active",
            "product_type": "trending",
            "stock": 40,
            "category_id": 5,
            "tag": "hot",
            "short_description": "Sạc nhanh Anker Nano II 65W nhỏ gọn, đa cổng."
        },
        # Điện thoại - sản phẩm liên quan đến "đánh giá cao"
        {
            "title": "Realme GT 7 Pro",
            "image": "realme-gt7-pro.jpg",
            "price": 699.0,
            "currentPrice": 649.0,
            "status": "active",
            "product_type": "trending",
            "stock": 12,
            "category_id": 1,
            "tag": "hot",
            "short_description": "Realme GT 7 Pro hiệu năng mạnh, đánh giá cao trên các diễn đàn.",
            "rating": 4.8
        },
        {
            "title": "MacBook Pro M4 2025",
            "image": "macbook-pro-m4.jpg",
            "price": 2199.0,
            "currentPrice": 2099.0,
            "status": "active",
            "product_type": "best_seller",
            "stock": 7,
            "category_id": 2,
            "tag": "new",
            "short_description": "MacBook Pro M4 2025, đánh giá cao bởi reviewer quốc tế.",
            "rating": 4.9
        },
    ]

    # Add products
    for product_data in products:
        # Nếu đã có sản phẩm cùng title và product_type thì bỏ qua (tránh trùng lặp khi seed nhiều lần)
        exists = db.query(models.Product).filter_by(title=product_data["title"], product_type=product_data["product_type"]).first()
        if not exists:
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