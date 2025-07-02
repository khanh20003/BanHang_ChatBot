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
            Product(title="Samsung Galaxy S24 Ultra", brand_id=samsung.id, category_id=phone_cat.id, price=30000000, currentPrice=25000000, product_type="flash_sale", tag="giảm giá, flash sale", status="active", stock=20, short_description="Samsung Galaxy S24 Ultra flagship, màn hình Dynamic AMOLED 2X 6.8 inch, Snapdragon 8 Gen 3, RAM 12GB, ROM 256GB, camera 200MP, pin 5000mAh, sạc nhanh 45W, hỗ trợ S Pen, chống nước IP68, bảo hành 12 tháng."),
            Product(title="iPhone 15 Pro Max", brand_id=apple.id, category_id=phone_cat.id, price=35000000, currentPrice=32000000, product_type="flash_sale", tag="sale, giảm giá", status="active", stock=15, short_description="iPhone 15 Pro Max mới nhất, màn hình OLED 6.7 inch, chip Apple A17 Pro, RAM 8GB, ROM 256GB, camera 48MP, USB-C, pin 4422mAh, sạc nhanh 20W, khung titan, bảo mật Face ID, bảo hành 12 tháng."),
            Product(title="Xiaomi Book S 12.4", brand_id=xiaomi.id, category_id=laptop_cat.id, price=15000000, currentPrice=12000000, product_type="flash_sale", tag="giảm giá, flash sale", status="active", stock=14, short_description="Laptop Xiaomi Book S 12.4, màn hình cảm ứng 12.4 inch, Snapdragon 8cx Gen2, RAM 8GB, SSD 256GB, pin 13 tiếng, sạc nhanh 65W, thiết kế mỏng nhẹ, bảo hành 12 tháng."),
        ]
        # Sản phẩm best_seller, newest, trending, các loại khác
        normal_products = [
            Product(title="Samsung Galaxy S24", brand_id=samsung.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="newest", tag="", status="active", stock=10, short_description="Samsung Galaxy S24, màn hình 6.2 inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, RAM 8GB, ROM 256GB, camera 50MP, pin 4000mAh, sạc nhanh 25W, thiết kế cao cấp, hỗ trợ 5G."),
            Product(title="Xiaomi 14 Ultra", brand_id=xiaomi.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="best_seller", tag="bán chạy", status="active", stock=30, short_description="Xiaomi 14 Ultra, màn hình AMOLED 6.73 inch, Snapdragon 8 Gen 3, RAM 12GB, ROM 512GB, camera Leica 50MP, pin 5000mAh, sạc nhanh 90W, thiết kế sang trọng."),
            Product(title="Realme GT 6", brand_id=realme.id, category_id=phone_cat.id, price=12000000, currentPrice=12000000, product_type="newest", tag="mới nhất", status="active", stock=25, short_description="Realme GT 6, màn hình AMOLED 6.78 inch, Snapdragon 8s Gen 3, RAM 12GB, ROM 256GB, camera 50MP, pin 5500mAh, sạc nhanh 120W, hiệu năng mạnh mẽ."),
            Product(title="MacBook Air M3", brand_id=apple.id, category_id=laptop_cat.id, price=32000000, currentPrice=32000000, product_type="best_seller", tag="bán chạy", status="active", stock=16, short_description="MacBook Air M3, màn hình Liquid Retina 13.6 inch, chip Apple M3, RAM 8GB, SSD 256GB, pin 18 tiếng, sạc nhanh 30W, thiết kế mỏng nhẹ, bảo mật Touch ID."),
            Product(title="iPad Pro 13 2024", brand_id=apple.id, category_id=tablet_cat.id, price=28000000, currentPrice=28000000, product_type="trending", tag="thịnh hành", status="active", stock=12, short_description="iPad Pro 13 2024, màn hình OLED 13 inch, chip Apple M4, RAM 16GB, ROM 512GB, Face ID, camera 12MP, pin 10000mAh, sạc nhanh 35W, hỗ trợ Apple Pencil Pro, thiết kế siêu mỏng."),
            Product(title="Samsung Galaxy Tab S9", brand_id=samsung.id, category_id=tablet_cat.id, price=18000000, currentPrice=18000000, product_type="newest", tag="mới nhất", status="active", stock=8, short_description="Samsung Galaxy Tab S9, màn hình AMOLED 11 inch, Snapdragon 8 Gen 2, RAM 8GB, ROM 256GB, camera 13MP, pin 8400mAh, sạc nhanh 45W, chống nước IP68, hỗ trợ S Pen."),
            Product(title="Sony WH-1000XM5", brand_id=None, category_id=headphone_cat.id, price=9000000, currentPrice=9000000, product_type="best_seller", tag="bán chạy", status="active", stock=20, short_description="Tai nghe chống ồn Sony WH-1000XM5, driver 30mm, chống ồn chủ động, pin 30 tiếng, sạc nhanh, kết nối Bluetooth 5.2, cảm ứng điều khiển."),
            Product(title="AirPods Pro 2", brand_id=apple.id, category_id=headphone_cat.id, price=6000000, currentPrice=6000000, product_type="trending", tag="thịnh hành", status="active", stock=18, short_description="Tai nghe true wireless AirPods Pro 2, chống ồn chủ động, chip H2, pin 6 tiếng, sạc MagSafe, kháng nước IPX4, hỗ trợ Find My."),
            Product(title="Cáp sạc nhanh USB-C", brand_id=None, category_id=accessory_cat.id, price=250000, currentPrice=250000, product_type="newest", tag="", status="active", stock=100, short_description="Cáp sạc nhanh USB-C, hỗ trợ sạc nhanh 20W, chiều dài 1m, lõi đồng bền bỉ, tương thích nhiều thiết bị."),
            Product(title="Ốp lưng iPhone 15", brand_id=None, category_id=accessory_cat.id, price=350000, currentPrice=350000, product_type="newest", tag="", status="active", stock=50, short_description="Ốp lưng bảo vệ iPhone 15, chất liệu silicone cao cấp, chống sốc, ôm sát máy, nhiều màu sắc trẻ trung."),
            Product(title="Oppo Reno 11", brand_id=None, category_id=phone_cat.id, price=9000000, currentPrice=9000000, product_type="trending", tag="thịnh hành", status="active", stock=0, short_description="Oppo Reno 11, màn hình AMOLED 6.7 inch, MediaTek Dimensity 8200, camera 50MP, pin 5000mAh, sạc nhanh 67W, thiết kế trẻ trung."),
            Product(title="MacBook Pro 2023", brand_id=apple.id, category_id=laptop_cat.id, price=42000000, currentPrice=42000000, product_type="best_seller", tag="bán chạy", status="active", stock=0, short_description="MacBook Pro 2023, màn hình Liquid Retina XDR 14 inch, chip Apple M3 Pro, RAM 16GB, SSD 512GB, pin 18 tiếng, Touch ID, thiết kế sang trọng."),
            Product(title="Realme C53", brand_id=realme.id, category_id=phone_cat.id, price=3500000, currentPrice=3500000, product_type="trending", tag="thịnh hành", status="active", stock=40, short_description="Realme C53, màn hình IPS LCD 6.74 inch, Unisoc T612, camera 50MP, pin 5000mAh, sạc nhanh 33W, giá rẻ, phù hợp học sinh."),
            Product(title="Xiaomi Redmi 13C", brand_id=xiaomi.id, category_id=phone_cat.id, price=3200000, currentPrice=3200000, product_type="trending", tag="thịnh hành", status="active", stock=35, short_description="Xiaomi Redmi 13C, màn hình IPS LCD 6.74 inch, MediaTek Helio G85, camera 50MP, pin 5000mAh, sạc nhanh 18W, giá rẻ, thiết kế trẻ trung."),
            Product(title="iPhone 15 Pro Max 1TB", brand_id=apple.id, category_id=phone_cat.id, price=48000000, currentPrice=48000000, product_type="newest", tag="mới nhất", status="active", stock=5, short_description="iPhone 15 Pro Max 1TB, màn hình OLED 6.7 inch, chip Apple A17 Pro, bộ nhớ 1TB, camera 48MP, USB-C, pin bền bỉ, khung titan, bảo hành 12 tháng."),
        ]
        # Sản phẩm best_seller, newest, trending, các loại khác
        normal_products = [
            Product(title="Samsung Galaxy S24", brand_id=samsung.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="newest", tag="", status="active", stock=10, short_description="Samsung Galaxy S24, màn hình 6.2 inch Dynamic AMOLED 2X, Snapdragon 8 Gen 3, RAM 8GB, ROM 256GB, camera 50MP, pin 4000mAh, sạc nhanh 25W, thiết kế cao cấp, hỗ trợ 5G."),
            Product(title="Xiaomi 14 Ultra", brand_id=xiaomi.id, category_id=phone_cat.id, price=20000000, currentPrice=20000000, product_type="best_seller", tag="bán chạy", status="active", stock=30, short_description="Xiaomi 14 Ultra, màn hình AMOLED 6.73 inch, Snapdragon 8 Gen 3, RAM 12GB, ROM 512GB, camera Leica 50MP, pin 5000mAh, sạc nhanh 90W, thiết kế sang trọng."),
            Product(title="Realme GT 6", brand_id=realme.id, category_id=phone_cat.id, price=12000000, currentPrice=12000000, product_type="newest", tag="mới nhất", status="active", stock=25, short_description="Realme GT 6, màn hình AMOLED 6.78 inch, Snapdragon 8s Gen 3, RAM 12GB, ROM 256GB, camera 50MP, pin 5500mAh, sạc nhanh 120W, hiệu năng mạnh mẽ."),
            Product(title="MacBook Air M3", brand_id=apple.id, category_id=laptop_cat.id, price=32000000, currentPrice=32000000, product_type="best_seller", tag="bán chạy", status="active", stock=16, short_description="MacBook Air M3, màn hình Liquid Retina 13.6 inch, chip Apple M3, RAM 8GB, SSD 256GB, pin 18 tiếng, sạc nhanh 30W, thiết kế mỏng nhẹ, bảo mật Touch ID."),
            Product(title="iPad Pro 13 2024", brand_id=apple.id, category_id=tablet_cat.id, price=28000000, currentPrice=28000000, product_type="trending", tag="thịnh hành", status="active", stock=12, short_description="iPad Pro 13 2024, màn hình OLED 13 inch, chip Apple M4, RAM 16GB, ROM 512GB, Face ID, camera 12MP, pin 10000mAh, sạc nhanh 35W, hỗ trợ Apple Pencil Pro, thiết kế siêu mỏng."),
            Product(title="Samsung Galaxy Tab S9", brand_id=samsung.id, category_id=tablet_cat.id, price=18000000, currentPrice=18000000, product_type="newest", tag="mới nhất", status="active", stock=8, short_description="Samsung Galaxy Tab S9, màn hình AMOLED 11 inch, Snapdragon 8 Gen 2, RAM 8GB, ROM 256GB, camera 13MP, pin 8400mAh, sạc nhanh 45W, chống nước IP68, hỗ trợ S Pen."),
            Product(title="Sony WH-1000XM5", brand_id=None, category_id=headphone_cat.id, price=9000000, currentPrice=9000000, product_type="best_seller", tag="bán chạy", status="active", stock=20, short_description="Tai nghe chống ồn Sony WH-1000XM5, driver 30mm, chống ồn chủ động, pin 30 tiếng, sạc nhanh, kết nối Bluetooth 5.2, cảm ứng điều khiển."),
            Product(title="AirPods Pro 2", brand_id=apple.id, category_id=headphone_cat.id, price=6000000, currentPrice=6000000, product_type="trending", tag="thịnh hành", status="active", stock=18, short_description="Tai nghe true wireless AirPods Pro 2, chống ồn chủ động, chip H2, pin 6 tiếng, sạc MagSafe, kháng nước IPX4, hỗ trợ Find My."),
            Product(title="Cáp sạc nhanh USB-C", brand_id=None, category_id=accessory_cat.id, price=250000, currentPrice=250000, product_type="newest", tag="", status="active", stock=100, short_description="Cáp sạc nhanh USB-C, hỗ trợ sạc nhanh 20W, chiều dài 1m, lõi đồng bền bỉ, tương thích nhiều thiết bị."),
            Product(title="Ốp lưng iPhone 15", brand_id=None, category_id=accessory_cat.id, price=350000, currentPrice=350000, product_type="newest", tag="", status="active", stock=50, short_description="Ốp lưng bảo vệ iPhone 15, chất liệu silicone cao cấp, chống sốc, ôm sát máy, nhiều màu sắc trẻ trung."),
            Product(title="Oppo Reno 11", brand_id=None, category_id=phone_cat.id, price=9000000, currentPrice=9000000, product_type="trending", tag="thịnh hành", status="active", stock=0, short_description="Oppo Reno 11, màn hình AMOLED 6.7 inch, MediaTek Dimensity 8200, camera 50MP, pin 5000mAh, sạc nhanh 67W, thiết kế trẻ trung."),
            Product(title="MacBook Pro 2023", brand_id=apple.id, category_id=laptop_cat.id, price=42000000, currentPrice=42000000, product_type="best_seller", tag="bán chạy", status="active", stock=0, short_description="MacBook Pro 2023, màn hình Liquid Retina XDR 14 inch, chip Apple M3 Pro, RAM 16GB, SSD 512GB, pin 18 tiếng, Touch ID, thiết kế sang trọng."),
            Product(title="Realme C53", brand_id=realme.id, category_id=phone_cat.id, price=3500000, currentPrice=3500000, product_type="trending", tag="thịnh hành", status="active", stock=40, short_description="Realme C53, màn hình IPS LCD 6.74 inch, Unisoc T612, camera 50MP, pin 5000mAh, sạc nhanh 33W, giá rẻ, phù hợp học sinh."),
            Product(title="Xiaomi Redmi 13C", brand_id=xiaomi.id, category_id=phone_cat.id, price=3200000, currentPrice=3200000, product_type="trending", tag="thịnh hành", status="active", stock=35, short_description="Xiaomi Redmi 13C, màn hình IPS LCD 6.74 inch, MediaTek Helio G85, camera 50MP, pin 5000mAh, sạc nhanh 18W, giá rẻ, thiết kế trẻ trung."),
            Product(title="iPhone 15 Pro Max 1TB", brand_id=apple.id, category_id=phone_cat.id, price=48000000, currentPrice=48000000, product_type="newest", tag="mới nhất", status="active", stock=5, short_description="iPhone 15 Pro Max 1TB, màn hình OLED 6.7 inch, chip Apple A17 Pro, bộ nhớ 1TB, camera 48MP, USB-C, pin bền bỉ, khung titan, bảo hành 12 tháng."),
        ]
        # Bổ sung thêm sản phẩm đa dạng cho mọi intent thực tế
        normal_products += [
            Product(title="Samsung Galaxy A55", brand_id=samsung.id, category_id=phone_cat.id, price=12000000, currentPrice=10000000, product_type="flash_sale", tag="giảm giá, bán chạy", status="active", stock=22, short_description="Samsung Galaxy A55, màn hình Super AMOLED 6.6 inch, Exynos 1480, camera 50MP, pin 5000mAh, sạc nhanh 25W, thiết kế trẻ trung.", rating=4.8),
            Product(title="iPhone 14", brand_id=apple.id, category_id=phone_cat.id, price=22000000, currentPrice=21000000, product_type="best_seller", tag="bán chạy", status="active", stock=12, short_description="iPhone 14 bán chạy, màn hình OLED 6.1 inch, chip Apple A15 Bionic, camera kép 12MP, pin 3279mAh, Face ID, nhiều màu sắc.", rating=4.7),
            Product(title="Xiaomi Pad 6", brand_id=xiaomi.id, category_id=tablet_cat.id, price=9000000, currentPrice=8500000, product_type="flash_sale", tag="giảm giá", status="active", stock=18, short_description="Xiaomi Pad 6, màn hình IPS LCD 11 inch, Snapdragon 870, RAM 8GB, pin 8840mAh, sạc nhanh 33W, thiết kế mỏng nhẹ.", rating=4.6),
            Product(title="Realme Buds T300", brand_id=realme.id, category_id=headphone_cat.id, price=1200000, currentPrice=1000000, product_type="trending", tag="thịnh hành", status="active", stock=30, short_description="Tai nghe true wireless Realme Buds T300, chống ồn chủ động, pin 40 tiếng, sạc nhanh, Bluetooth 5.3.", rating=4.5),
            Product(title="Samsung Galaxy Watch 6", brand_id=samsung.id, category_id=accessory_cat.id, price=7000000, currentPrice=6500000, product_type="best_seller", tag="bán chạy", status="active", stock=15, short_description="Samsung Galaxy Watch 6, màn hình Super AMOLED 1.5 inch, Exynos W930, pin 425mAh, chống nước 5ATM, nhiều tính năng sức khoẻ.", rating=4.9),
            Product(title="iPhone SE 2022", brand_id=apple.id, category_id=phone_cat.id, price=9000000, currentPrice=9000000, product_type="newest", tag="", status="active", stock=20, short_description="iPhone SE 2022 nhỏ gọn, màn hình 4.7 inch, chip Apple A15 Bionic, camera đơn 12MP, Touch ID, pin 2018mAh, giá tốt.", rating=4.9),
            Product(title="Xiaomi Mi Band 8", brand_id=xiaomi.id, category_id=accessory_cat.id, price=900000, currentPrice=900000, product_type="trending", tag="thịnh hành", status="active", stock=60, short_description="Vòng đeo tay thông minh Xiaomi Mi Band 8, màn hình AMOLED 1.62 inch, pin 16 ngày, nhiều chế độ luyện tập.", rating=4.8),
            Product(title="Sạc nhanh Anker 20W", brand_id=None, category_id=accessory_cat.id, price=350000, currentPrice=320000, product_type="flash_sale", tag="giảm giá", status="active", stock=80, short_description="Sạc nhanh Anker 20W, hỗ trợ Power Delivery, nhỏ gọn, an toàn, bảo hành 18 tháng.", rating=4.7),
            Product(title="iPad 10th Gen", brand_id=apple.id, category_id=tablet_cat.id, price=12000000, currentPrice=11500000, product_type="best_seller", tag="bán chạy", status="active", stock=14, short_description="iPad 10th Gen, màn hình 10.9 inch Liquid Retina, chip Apple A14 Bionic, camera 12MP, pin 10 tiếng, hỗ trợ Apple Pencil.", rating=4.8),
            Product(title="JBL Tune 510BT", brand_id=None, category_id=headphone_cat.id, price=1200000, currentPrice=900000, product_type="flash_sale", tag="giảm giá", status="active", stock=25, short_description="Tai nghe không dây JBL Tune 510BT, pin 40 tiếng, sạc nhanh, Bluetooth 5.0, thiết kế gập gọn.", rating=4.6),
        ]
        # Bổ sung thêm nhiều sản phẩm iPhone đa dạng để test intent
        iphone_products = [
            Product(title="iPhone 11", brand_id=apple.id, category_id=phone_cat.id, price=12000000, currentPrice=11500000, product_type="best_seller", tag="bán chạy", status="active", stock=20, short_description="iPhone 11 quốc tế, màn hình 6.1 inch Liquid Retina, chip Apple A13 Bionic, RAM 4GB, ROM 64GB, camera kép 12MP, pin 3110mAh, Face ID, hỗ trợ sạc nhanh 18W, bảo hành 12 tháng.", rating=4.6),
            Product(title="iPhone 12", brand_id=apple.id, category_id=phone_cat.id, price=15000000, currentPrice=14500000, product_type="trending", tag="thịnh hành", status="active", stock=18, short_description="iPhone 12 chính hãng, màn hình OLED 6.1 inch, chip Apple A14 Bionic, RAM 4GB, ROM 128GB, camera kép 12MP, hỗ trợ 5G, pin 2815mAh, sạc nhanh 20W, thiết kế viền phẳng sang trọng.", rating=4.7),
            Product(title="iPhone 13", brand_id=apple.id, category_id=phone_cat.id, price=18000000, currentPrice=17500000, product_type="newest", tag="mới nhất", status="active", stock=15, short_description="iPhone 13 màu xanh, màn hình Super Retina XDR 6.1 inch, chip Apple A15 Bionic, RAM 4GB, ROM 128GB, camera kép 12MP, pin 3240mAh, sạc nhanh 20W, chống nước IP68.", rating=4.8),
            Product(title="iPhone 14 Pro", brand_id=apple.id, category_id=phone_cat.id, price=25000000, currentPrice=24000000, product_type="flash_sale", tag="giảm giá", status="active", stock=10, short_description="iPhone 14 Pro giảm giá, màn hình 6.1 inch ProMotion, Dynamic Island, chip Apple A16 Bionic, RAM 6GB, ROM 128GB, camera chính 48MP, Face ID, pin 3200mAh, sạc nhanh 20W, thiết kế cao cấp.", rating=4.9),
            Product(title="iPhone 15", brand_id=apple.id, category_id=phone_cat.id, price=28000000, currentPrice=27000000, product_type="newest", tag="mới nhất", status="active", stock=12, short_description="iPhone 15 chính hãng, màn hình OLED 6.1 inch, chip Apple A16 Bionic, RAM 6GB, ROM 128GB, camera kép 48MP, USB-C, pin 3349mAh, sạc nhanh 20W, nhiều màu sắc mới.", rating=4.9),
            Product(title="iPhone SE 2020", brand_id=apple.id, category_id=phone_cat.id, price=8000000, currentPrice=7800000, product_type="best_seller", tag="bán chạy", status="active", stock=8, short_description="iPhone SE nhỏ gọn, màn hình 4.7 inch, chip Apple A13 Bionic, RAM 3GB, ROM 64GB, camera đơn 12MP, Touch ID, pin 1821mAh, sạc nhanh 18W, giá rẻ, phù hợp cho người thích nhỏ gọn.", rating=4.5),
            Product(title="iPhone 13 Mini", brand_id=apple.id, category_id=phone_cat.id, price=16000000, currentPrice=15500000, product_type="trending", tag="thịnh hành", status="active", stock=7, short_description="iPhone 13 Mini nhỏ gọn, màn hình 5.4 inch Super Retina XDR, chip Apple A15 Bionic, RAM 4GB, ROM 128GB, camera kép 12MP, pin 2438mAh, sạc nhanh 20W, nhiều màu trẻ trung.", rating=4.7),
            Product(title="iPhone 12 Pro Max", brand_id=apple.id, category_id=phone_cat.id, price=20000000, currentPrice=19500000, product_type="flash_sale", tag="giảm giá", status="active", stock=6, short_description="iPhone 12 Pro Max giảm giá, màn hình 6.7 inch, chip Apple A14 Bionic, RAM 6GB, ROM 128GB, camera 3 ống kính 12MP, LiDAR, pin 3687mAh, sạc nhanh 20W, thiết kế sang trọng.", rating=4.8),
        ]
        # Bổ sung thêm sản phẩm iPhone 15 màu xanh để test intent tìm kiếm màu
        iphone_products.append(Product(
            title="iPhone 15",
            brand_id=apple.id,
            category_id=phone_cat.id,
            price=28000000,
            currentPrice=27000000,
            product_type="newest",
            tag="mới nhất",
            status="active",
            stock=8,
            short_description="iPhone 15 màu xanh, màn hình OLED 6.1 inch, chip Apple A16 Bionic, RAM 6GB, ROM 128GB, camera kép 48MP, USB-C, pin 3349mAh, sạc nhanh 20W, nhiều màu sắc mới.",
            rating=4.9
        ))
        def clean_title(title):
            keywords = ["giảm giá", "flash sale", "bán chạy", "mới nhất", "trending", "thịnh hành", "best seller", "sale"]
            for kw in keywords:
                title = title.replace(kw, "").replace(kw.title(), "").replace(kw.upper(), "").strip()
            return " ".join(title.split())
        for p in iphone_products:
            p.title = clean_title(p.title)
        # Tự động thêm màu vào short_description nếu có
        def append_color_to_short_desc(product):
            if hasattr(product, 'color') and product.color:
                desc = getattr(product, 'short_description', '') or ''
                color_text = f" Màu sắc: {product.color}"
                if color_text.strip() not in desc:
                    result = desc.strip() + color_text
                else:
                    result = desc
                # Xoá thuộc tính color khỏi product
                delattr(product, 'color')
                return result
            else:
                return getattr(product, 'short_description', '') or ''
        products = discount_products + normal_products + iphone_products
        for p in products:
            # Ghép màu vào short_description nếu có, sau đó xoá color
            p.short_description = append_color_to_short_desc(p)
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
