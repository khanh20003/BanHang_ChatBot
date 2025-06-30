import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.content_models import Product, Category, Brand
from database.database import SessionLocal
from sqlalchemy.orm import Session

def seed_products():
    db: Session = SessionLocal()
    try:
        # Xoá toàn bộ sản phẩm cũ
        db.query(Product).delete()
        db.commit()

        # Đảm bảo luôn có brand/category chuẩn trước khi seed sản phẩm
        def get_or_create_brand(db, title):
            brand = db.query(Brand).filter(Brand.title.ilike(f'%{title}%')).first()
            if not brand:
                brand = Brand(title=title)
                db.add(brand)
                db.commit()
                db.refresh(brand)
            return brand
        def get_or_create_category(db, title):
            category = db.query(Category).filter(Category.title.ilike(f'%{title}%')).first()
            if not category:
                category = Category(title=title)
                db.add(category)
                db.commit()
                db.refresh(category)
            return category
        # Tạo brand/category nếu chưa có
        samsung = get_or_create_brand(db, 'Samsung')
        apple = get_or_create_brand(db, 'Apple')
        xiaomi = get_or_create_brand(db, 'Xiaomi')
        realme = get_or_create_brand(db, 'Realme')
        phone_cat = get_or_create_category(db, 'điện thoại')
        laptop_cat = get_or_create_category(db, 'laptop')
        tablet_cat = get_or_create_category(db, 'máy tính bảng')
        headphone_cat = get_or_create_category(db, 'tai nghe')
        accessory_cat = get_or_create_category(db, 'phụ kiện')

        # Sản phẩm giảm giá (flash_sale, tag giảm giá, title tự nhiên)
        discount_products = [
            Product(title="Samsung Galaxy S24 Ultra", brand_id=samsung.id, category_id=phone_cat.id, price=30000000, currentPrice=25000000, product_type="flash_sale", tag="giảm giá, flash sale", status="active", stock=20, short_description="Flagship Samsung giảm giá sốc"),
            Product(title="iPhone 15 Pro Max", brand_id=apple.id, category_id=phone_cat.id, price=35000000, currentPrice=32000000, product_type="flash_sale", tag="sale, giảm giá", status="active", stock=15, short_description="iPhone mới nhất, giá tốt"),
            Product(title="Xiaomi Book S 12.4", brand_id=xiaomi.id, category_id=laptop_cat.id, price=15000000, currentPrice=12000000, product_type="flash_sale", tag="giảm giá, flash sale", status="active", stock=14, short_description="Laptop Xiaomi giảm giá"),
        ]
        # Sản phẩm best_seller, newest, trending, các loại khác
        normal_products = [
            Product(title="Samsung Galaxy S24", brand_id=samsung.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="newest", tag="", status="active", stock=10, short_description="Điện thoại flagship Samsung"),
            Product(title="Xiaomi 14 Ultra", brand_id=xiaomi.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="best_seller", tag="bán chạy", status="active", stock=30, short_description="Bán chạy nhất của Xiaomi"),
            Product(title="Realme GT 6", brand_id=realme.id, category_id=phone_cat.id, price=12000000, currentPrice=12000000, product_type="newest", tag="mới nhất", status="active", stock=25, short_description="Hàng mới Realme"),
            Product(title="MacBook Air M3", brand_id=apple.id, category_id=laptop_cat.id, price=32000000, currentPrice=32000000, product_type="best_seller", tag="bán chạy", status="active", stock=16, short_description="MacBook Air M3 bán chạy"),
            Product(title="iPad Pro 13 2024", brand_id=apple.id, category_id=tablet_cat.id, price=28000000, currentPrice=28000000, product_type="trending", tag="thịnh hành", status="active", stock=12, short_description="Tablet cao cấp Apple"),
            Product(title="Samsung Galaxy Tab S9", brand_id=samsung.id, category_id=tablet_cat.id, price=18000000, currentPrice=18000000, product_type="newest", tag="mới nhất", status="active", stock=8, short_description="Tablet Samsung mới nhất"),
            Product(title="Sony WH-1000XM5", brand_id=None, category_id=headphone_cat.id, price=9000000, currentPrice=9000000, product_type="best_seller", tag="bán chạy", status="active", stock=20, short_description="Tai nghe chống ồn Sony"),
            Product(title="AirPods Pro 2", brand_id=apple.id, category_id=headphone_cat.id, price=6000000, currentPrice=6000000, product_type="trending", tag="thịnh hành", status="active", stock=18, short_description="Tai nghe true wireless Apple"),
            Product(title="Cáp sạc nhanh USB-C", brand_id=None, category_id=accessory_cat.id, price=250000, currentPrice=250000, product_type="newest", tag="", status="active", stock=100, short_description="Cáp sạc nhanh cho điện thoại"),
            Product(title="Ốp lưng iPhone 15", brand_id=None, category_id=accessory_cat.id, price=350000, currentPrice=350000, product_type="newest", tag="", status="active", stock=50, short_description="Ốp lưng bảo vệ iPhone 15"),
            # Sản phẩm hết hàng
            Product(title="Oppo Reno 11", brand_id=None, category_id=phone_cat.id, price=9000000, currentPrice=9000000, product_type="trending", tag="thịnh hành", status="active", stock=0, short_description="Điện thoại Oppo hết hàng"),
            Product(title="MacBook Pro 2023", brand_id=apple.id, category_id=laptop_cat.id, price=42000000, currentPrice=42000000, product_type="best_seller", tag="bán chạy", status="active", stock=0, short_description="MacBook Pro hết hàng"),
            # Sản phẩm giá rẻ
            Product(title="Realme C53", brand_id=realme.id, category_id=phone_cat.id, price=3500000, currentPrice=3500000, product_type="trending", tag="thịnh hành", status="active", stock=40, short_description="Điện thoại giá rẻ Realme"),
            Product(title="Xiaomi Redmi 13C", brand_id=xiaomi.id, category_id=phone_cat.id, price=3200000, currentPrice=3200000, product_type="trending", tag="thịnh hành", status="active", stock=35, short_description="Điện thoại giá rẻ Xiaomi"),
            # Sản phẩm cao cấp
            Product(title="iPhone 15 Pro Max 1TB", brand_id=apple.id, category_id=phone_cat.id, price=48000000, currentPrice=48000000, product_type="newest", tag="mới nhất", status="active", stock=5, short_description="iPhone cao cấp nhất 2024"),
        ]
        # Bổ sung thêm sản phẩm đa dạng cho mọi intent thực tế
        normal_products += [
            # Sản phẩm vừa bán chạy vừa giảm giá còn hàng, rating cao
            Product(title="Samsung Galaxy A55", brand_id=samsung.id, category_id=phone_cat.id, price=12000000, currentPrice=10000000, product_type="flash_sale", tag="giảm giá, bán chạy", status="active", stock=22, short_description="Điện thoại tầm trung Samsung", rating=4.8),
            Product(title="iPhone 14", brand_id=apple.id, category_id=phone_cat.id, price=22000000, currentPrice=21000000, product_type="best_seller", tag="bán chạy", status="active", stock=12, short_description="iPhone 14 bán chạy", rating=4.7),
            Product(title="Xiaomi Pad 6", brand_id=xiaomi.id, category_id=tablet_cat.id, price=9000000, currentPrice=8500000, product_type="flash_sale", tag="giảm giá", status="active", stock=18, short_description="Tablet giá tốt Xiaomi", rating=4.6),
            Product(title="Realme Buds T300", brand_id=realme.id, category_id=headphone_cat.id, price=1200000, currentPrice=1000000, product_type="trending", tag="thịnh hành", status="active", stock=30, short_description="Tai nghe true wireless Realme", rating=4.5),
            Product(title="Samsung Galaxy Watch 6", brand_id=samsung.id, category_id=accessory_cat.id, price=7000000, currentPrice=6500000, product_type="best_seller", tag="bán chạy", status="active", stock=15, short_description="Đồng hồ thông minh Samsung", rating=4.9),
            # Sản phẩm đánh giá cao, còn hàng
            Product(title="iPhone SE 2022", brand_id=apple.id, category_id=phone_cat.id, price=9000000, currentPrice=9000000, product_type="newest", tag="", status="active", stock=20, short_description="iPhone nhỏ gọn giá tốt", rating=4.9),
            Product(title="Xiaomi Mi Band 8", brand_id=xiaomi.id, category_id=accessory_cat.id, price=900000, currentPrice=900000, product_type="trending", tag="thịnh hành", status="active", stock=60, short_description="Vòng đeo tay thông minh Xiaomi", rating=4.8),
            # Sản phẩm phụ kiện giá rẻ, còn hàng
            Product(title="Sạc nhanh Anker 20W", brand_id=None, category_id=accessory_cat.id, price=350000, currentPrice=320000, product_type="flash_sale", tag="giảm giá", status="active", stock=80, short_description="Sạc nhanh giá rẻ Anker", rating=4.7),
            # Sản phẩm tablet bán chạy, còn hàng
            Product(title="iPad 10th Gen", brand_id=apple.id, category_id=tablet_cat.id, price=12000000, currentPrice=11500000, product_type="best_seller", tag="bán chạy", status="active", stock=14, short_description="iPad phổ thông bán chạy", rating=4.8),
            # Sản phẩm tai nghe giảm giá, còn hàng
            Product(title="JBL Tune 510BT", brand_id=None, category_id=headphone_cat.id, price=1200000, currentPrice=900000, product_type="flash_sale", tag="giảm giá", status="active", stock=25, short_description="Tai nghe không dây JBL", rating=4.6),
        ]
        # Bổ sung thêm nhiều sản phẩm iPhone đa dạng để test intent
        iphone_products = [
            Product(title="iPhone 11", brand_id=apple.id, category_id=phone_cat.id, price=12000000, currentPrice=11500000, product_type="best_seller", tag="bán chạy", status="active", stock=20, short_description="iPhone 11 quốc tế", rating=4.6),
            Product(title="iPhone 12", brand_id=apple.id, category_id=phone_cat.id, price=15000000, currentPrice=14500000, product_type="trending", tag="thịnh hành", status="active", stock=18, short_description="iPhone 12 chính hãng", rating=4.7),
            Product(title="iPhone 13", brand_id=apple.id, category_id=phone_cat.id, price=18000000, currentPrice=17500000, product_type="newest", tag="mới nhất", status="active", stock=15, short_description="iPhone 13 màu xanh", rating=4.8),
            Product(title="iPhone 14 Pro", brand_id=apple.id, category_id=phone_cat.id, price=25000000, currentPrice=24000000, product_type="flash_sale", tag="giảm giá", status="active", stock=10, short_description="iPhone 14 Pro giảm giá", rating=4.9),
            Product(title="iPhone 15", brand_id=apple.id, category_id=phone_cat.id, price=28000000, currentPrice=27000000, product_type="newest", tag="mới nhất", status="active", stock=12, short_description="iPhone 15 chính hãng", rating=4.9),
            Product(title="iPhone SE 2020", brand_id=apple.id, category_id=phone_cat.id, price=8000000, currentPrice=7800000, product_type="best_seller", tag="bán chạy", status="active", stock=8, short_description="iPhone SE nhỏ gọn", rating=4.5),
            Product(title="iPhone 13 Mini", brand_id=apple.id, category_id=phone_cat.id, price=16000000, currentPrice=15500000, product_type="trending", tag="thịnh hành", status="active", stock=7, short_description="iPhone 13 Mini nhỏ gọn", rating=4.7),
            Product(title="iPhone 12 Pro Max", brand_id=apple.id, category_id=phone_cat.id, price=20000000, currentPrice=19500000, product_type="flash_sale", tag="giảm giá", status="active", stock=6, short_description="iPhone 12 Pro Max giảm giá", rating=4.8),
        ]
        def clean_title(title):
            keywords = ["giảm giá", "flash sale", "bán chạy", "mới nhất", "trending", "thịnh hành", "best seller", "sale"]
            for kw in keywords:
                title = title.replace(kw, "").replace(kw.title(), "").replace(kw.upper(), "").strip()
            return " ".join(title.split())
        for p in iphone_products:
            p.title = clean_title(p.title)
        products = discount_products + normal_products + iphone_products
        for p in products:
            try:
                exists = db.query(Product).filter(Product.title == p.title).first()
                if not exists:
                    db.add(p)
            except Exception as e:
                print(f"[SEED ERROR] Lỗi khi thêm sản phẩm: {p.title} | Lỗi: {e}")
        try:
            db.commit()
            print("✅ Đã seed lại sản phẩm đa dạng, tối ưu cho mọi intent!")
        except Exception as e:
            print(f"[SEED ERROR] Lỗi khi commit dữ liệu: {e}")
    finally:
        db.close()

# Thêm log kiểm tra brand/category null
if __name__ == "__main__":
    try:
        seed_products()
    except Exception as e:
        print(f"[SEED ERROR] Lỗi tổng quát khi seed: {e}")
