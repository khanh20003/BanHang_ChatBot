import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from models.content_models import Product, Category
from database.database import SessionLocal
from sqlalchemy.orm import Session
from sqlalchemy import text

def seed_categories(db):
    # Xóa toàn bộ products trước, sau đó xóa categories
    db.execute(text("DELETE FROM products"))
    db.commit()
    db.execute(text("DELETE FROM categories"))
    db.commit()
    # Danh sách category tối thiểu cần cho products
    categories = [
        Category(id=8, title="Điện thoại", image="static/images/categories/phone.png", products=0),
        Category(id=9, title="Laptop", image="static/images/categories/laptop.png", products=0),
    ]
    for cat in categories:
        db.add(cat)
    db.commit()

def seed_products():
    db: Session = SessionLocal()
    try:
        # Seed categories trước khi seed products
        seed_categories(db)

        # Xóa dữ liệu các bảng liên quan trước khi xóa products (cart_items, carts)
        db.execute(text("DELETE FROM cart_items"))
        db.execute(text("DELETE FROM carts"))
        db.commit()

        # Danh sách sản phẩm seed đúng format, dữ liệu lấy từ file product.csv
        products_data = [
            Product(
                id=277,
                title="Laptop ASUS VivoBook S16",
                image="static/images/products/asusvivobooks16.png",
                price=18500000,
                currentPrice=17200000,
                status="active",
                product_type="best_seller",
                stock=23,
                category_id=9,
                tag="sale,laptop",
                short_description="Laptop ASUS VivoBook S16 mỏng nhẹ, viền màn hình siêu mỏng, Intel Core i7 Gen 13, RAM 16GB, SSD 512GB, màn hình 16 inch chuẩn màu 100% sRGB, bàn phím backlit, cảm biến vân tay. Brand_id: 0; Color: Bạc; Ram: 16GB; Rom: 512GB; Pin: 70Wh; Chip: Intel Core i7 Gen 13; Display: 16 inch 100% sRGB"
            ),
            Product(
                id=278,
                title="Laptop ASUS ZenBook",
                image="static/images/products/asuszenbook.png",
                price=26500000,
                currentPrice=24800000,
                status="active",
                product_type="trending",
                stock=56,
                category_id=9,
                tag="new,laptop",
                short_description="ASUS ZenBook ultrabook cao cấp, vỏ kim loại, chip Intel Evo i7 Gen 13, RAM 16GB, SSD 1TB, màn hình OLED 14 inch 2.8K, pin dài, sạc nhanh. Brand_id: 0; Color: Xanh; Ram: 16GB; Rom: 1TB; Pin: 75Wh; Chip: Intel Evo i7 Gen 13; Display: OLED 14 inch 2.8K"
            ),
            Product(
                id=279,
                title="Laptop Dell Gaming G Series",
                image="static/images/products/dellgamingg.png",
                price=28500000,
                currentPrice=25900000,
                status="active",
                product_type="best_seller",
                stock=76,
                category_id=9,
                tag="new,laptop",
                short_description="Dell Gaming G Series mạnh mẽ, Intel Core i7, GPU RTX 3050Ti, RAM 16GB, SSD 512GB, màn hình 15.6 inch 120Hz, thiết kế bền bỉ. Brand_id: 0; Color: Đen; Ram: 16GB; Rom: 512GB; Pin: 56Wh; Chip: Intel Core i7; Gpu: RTX 3050Ti; Display: 15.6 inch 120Hz"
            ),
            Product(
                id=280,
                title="Laptop Dell XPS",
                image="static/images/products/dellxps.png",
                price=35900000,
                currentPrice=33900000,
                status="active",
                product_type="trending",
                stock=76,
                category_id=9,
                tag="new,laptop",
                short_description="Dell XPS ultrabook cao cấp, vỏ nhôm, màn hình InfinityEdge 13.4 inch 3.5K OLED, Intel Core i7 Gen 13, RAM 16GB, SSD 1TB, pin lâu. Brand_id: 0; Color: Bạc; Ram: 16GB; Rom: 1TB; Pin: 52Wh; Chip: Intel Core i7 Gen 13; Display: 13.4 inch 3.5K OLED"
            ),
            Product(
                id=274,
                title="Vivo V40 Pro",
                image="static/images/products/vivov40.png",
                price=15000000,
                currentPrice=13500000,
                status="active",
                product_type="best_seller",
                stock=60,
                category_id=8,
                tag="tốt nhất,điện thoại",
                short_description="Vivo V40 Pro tốt nhất phân khúc, RAM 12GB, bộ nhớ 512GB, camera chống rung Gimbal 50MP, màn hình 120Hz, pin 5000mAh, sạc nhanh 80W, màu Đen. Brand_id: 0; Color: Đen; Ram: 12GB; Rom: 512GB; Pin: 5000mAh; Camera: 50MP; Charging: 80W"
            ),
            Product(
                id=275,
                title="Realme 12 Pro",
                image="static/images/products/realme-12-plus-1.webp",
                price=12000000,
                currentPrice=10900000,
                status="active",
                product_type="trending",
                stock=70,
                category_id=8,
                tag="trending,điện thoại",
                short_description="Realme 12 Pro đang trending, RAM 8GB, bộ nhớ 256GB, camera tiềm vọng 64MP, sạc nhanh 67W, thiết kế trẻ trung, pin 5000mAh, màu Xanh. Brand_id: 0; Color: Xanh; Ram: 8GB; Rom: 256GB; Pin: 5000mAh; Camera: 64MP; Charging: 67W"
            ),
            Product(
                id=276,
                title="Honor Magic 6",
                image="static/images/products/honor-magic-6-16gb-256gb-xtmobile.png",
                price=18000000,
                currentPrice=16500000,
                status="active",
                product_type="newest",
                stock=40,
                category_id=8,
                tag="newest,điện thoại",
                short_description="Honor Magic 6 mới ra mắt, RAM 12GB, bộ nhớ 512GB, màn hình LTPO 120Hz, Snapdragon 8 Gen 3, pin 5450mAh, camera 50MP, sạc nhanh 66W, màu Xanh. Brand_id: 0; Color: Xanh; Ram: 12GB; Rom: 512GB; Pin: 5450mAh; Camera: 50MP; Charging: 66W"
            ),
            Product(
                id=290,
                title="iPhone 16 Pro Max Sa Mạc",
                image="static/images/products/iPhone_16_Pro_Max_Desert_Titanium.png",
                price=45000000,
                currentPrice=42000000,
                status="active",
                product_type="best_seller",
                stock=8,
                category_id=8,
                tag="flagship,điện thoại",
                short_description="iPhone 16 Pro Max màu sa mạc, chip A18 Pro, RAM 12GB, bộ nhớ 1TB, camera 8K, pin 5000mAh, sạc nhanh USB-C. Brand_id: 0; Color: Xanh; Ram: 12GB; Rom: 1TB; Pin: 5000mAh; Camera: 8K; Charging: USB-C"
            ),
            Product(
                id=291,
                title="Samsung Galaxy S25 Ultra",
                image="static/images/products/samsungs25.png",
                price=38000000,
                currentPrice=35500000,
                status="active",
                product_type="newest",
                stock=12,
                category_id=8,
                tag="flagship,điện thoại,newest",
                short_description="Samsung Galaxy S25 Ultra, flagship 2025, RAM 12GB, bộ nhớ 1TB, camera 200MP, pin 5500mAh, sạc nhanh 45W. Brand_id: 0; Color: Đỏ; Ram: 12GB; Rom: 1TB; Pin: 5500mAh; Camera: 200MP; Charging: 45W"
            ),
            Product(
                id=270,
                title="Samsung Galaxy A55",
                image="static/images/products/samsung_a55_flashsale.png",
                price=9000000,
                currentPrice=6900000,
                status="active",
                product_type="flash_sale",
                stock=50,
                category_id=8,
                tag="giảm giá,flash sale,điện thoại",
                short_description="Samsung Galaxy A55 giảm giá sốc, màn hình Super AMOLED 120Hz, RAM 8GB, bộ nhớ 128GB, pin 5000mAh, camera 64MP, sạc nhanh 25W, màu Xanh. Brand_id: 0; Color: Xanh; Ram: 8GB; Rom: 128GB; Pin: 5000mAh; Camera: 64MP; Charging: 25W"
            ),
            Product(
                id=271,
                title="Xiaomi Redmi 12C",
                image="static/images/products/Xiaomi-12C-xanh-lá.png",
                price=3500000,
                currentPrice=2990000,
                status="active",
                product_type="best_seller",
                stock=100,
                category_id=8,
                tag="giá rẻ,điện thoại",
                short_description="Xiaomi Redmi 12C giá rẻ, RAM 4GB, bộ nhớ 64GB, pin trâu 5000mAh, màn hình lớn 6.71 inch, camera AI 50MP, sạc nhanh 10W, màu Xám, phù hợp học sinh sinh viên. Brand_id: 0; Color: Xám; Ram: 4GB; Rom: 64GB; Pin: 5000mAh; Camera: 50MP; Charging: 10W"
            ),
            Product(
                id=272,
                title="iPhone 16 Pro Max ",
                image="static/images/products/iphone16pm.png",
                price=45000000,
                currentPrice=42000000,
                status="active",
                product_type="best_seller",
                stock=10,
                category_id=8,
                tag="cao cấp,giá cao,điện thoại",
                short_description="iPhone 16 Pro Max bản cao cấp nhất, chip A18 Pro, RAM 12GB, bộ nhớ 1TB, camera 8K, màn hình ProMotion 120Hz, pin 5000mAh, sạc nhanh USB-C, màu Đen. Brand_id: 0; Color: Đen; Ram: 12GB; Rom: 1TB; Pin: 5000mAh; Camera: 8K; Charging: USB-C"
            ),
            Product(
                id=273,
                title="OPPO Reno 11F",
                image="static/images/products/opporeno13.png",
                price=8000000,
                currentPrice=7500000,
                status="active",
                product_type="best_seller",
                stock=80,
                category_id=8,
                tag="bán chạy,điện thoại",
                short_description="OPPO Reno 11F bán chạy, RAM 8GB, bộ nhớ 256GB, thiết kế mỏng nhẹ, camera chân dung AI 64MP, pin 5000mAh, sạc nhanh SuperVOOC 67W, màu Xanh. Brand_id: 0; Color: Xanh; Ram: 8GB; Rom: 256GB; Pin: 5000mAh; Camera: 64MP; Charging: 67W"
            ),
            Product(
                id=296,
                title="Laptop HP Pavilion",
                image="static/images/products/hppavilion.png",
                price=14800000,
                currentPrice=13800000,
                status="active",
                product_type="trending",
                stock=76,
                category_id=9,
                tag="new,laptop",
                short_description="HP Pavilion phổ thông, thiết kế trẻ trung, Intel Core i5, RAM 8GB, SSD 512GB, màn hình 15.6 inch, pin 7 giờ. Brand_id: 0; Color: Bạc; Ram: 8GB; Rom: 512GB; Pin: 41Wh; Chip: Intel Core i5; Display: 15.6 inch"
            ),
            Product(
                id=297,
                title="Laptop HP Pavilion x360",
                image="static/images/products/hppavilionx360.png",
                price=18900000,
                currentPrice=17500000,
                status="active",
                product_type="trending",
                stock=78,
                category_id=9,
                tag="new,laptop",
                short_description="HP Pavilion x360 2-in-1 gập xoay, màn hình cảm ứng 14 inch, Intel Core i5 Gen 12, RAM 8GB, SSD 512GB, hỗ trợ bút stylus. Brand_id: 0; Color: Bạc; Ram: 8GB; Rom: 512GB; Pin: 43Wh; Chip: Intel Core i5 Gen 12; Display: 14 inch cảm ứng"
            ),
            Product(
                id=292,
                title="OPPO Find X7 Pro Tím",
                image="static/images/products/oppo-find-x7-16gb-512gb.png",
                price=25000000,
                currentPrice=22900000,
                status="active",
                product_type="trending",
                stock=20,
                category_id=8,
                tag="flagship,điện thoại,trending",
                short_description="OPPO Find X7 Pro màu Tím, RAM 16GB, bộ nhớ 512GB, camera 50MP, pin 5000mAh, sạc nhanh 100W. Brand_id: 0; Color: Tím; Ram: 16GB; Rom: 512GB; Pin: 5000mAh; Camera: 50MP; Charging: 100W"
            ),
            Product(
                id=294,
                title="Acer Nitro 5 Đỏ",
                image="static/images/products/acernitro.png",
                price=28000000,
                currentPrice=25900000,
                status="active",
                product_type="trending",
                stock=18,
                category_id=9,
                tag="gaming,laptop,trending",
                short_description="Acer Nitro 5 màu Đỏ, gaming, Core i7 Gen 13, RAM 16GB, SSD 1TB, RTX 4060, màn 15.6 inch 165Hz. Brand_id: 0; Color: Đỏ; Ram: 16GB; Rom: 1TB; Pin: 57Wh; Chip: Intel Core i7 Gen 13; Gpu: RTX 4060; Display: 15.6 inch 165Hz"
            ),
            Product(
                id=295,
                title="Lenovo Yoga Slim 7i Xám",
                image="static/images/products/lenovoyoga.png",
                price=24000000,
                currentPrice=22500000,
                status="active",
                product_type="newest",
                stock=15,
                category_id=9,
                tag="ultrabook,laptop,newest",
                short_description="Lenovo Yoga Slim 7i màu Xám, ultrabook, Core i7 Gen 13, RAM 16GB, SSD 1TB, màn 14 inch 2.8K OLED. Brand_id: 0; Color: Xám; Ram: 16GB; Rom: 1TB; Pin: 61Wh; Chip: Intel Core i7 Gen 13; Display: 14 inch 2.8K OLED"
            ),
            Product(
                id=293,
                title="MSI Katana",
                image="static/images/products/msikatana.png",
                price=42000000,
                currentPrice=39900000,
                status="active",
                product_type="best_seller",
                stock=10,
                category_id=9,
                tag="gaming,laptop,best_seller",
                short_description="MSI katana màu Xanh, gaming, Core i9 Gen 14, RAM 32GB, SSD 2TB, RTX 4090, màn 16 inch 240Hz. Brand_id: 0; Color: Xanh; Ram: 32GB; Rom: 2TB; Pin: 99Wh; Chip: Intel Core i9 Gen 14; Gpu: RTX 4090; Display: 16 inch 240Hz"
            ),
        ]
        # Xoá toàn bộ sản phẩm cũ
        db.query(Product).delete()
        db.commit()
        for p in products_data:
            db.add(p)
        db.commit()
        print(f"✅ Đã seed {len(products_data)} sản phẩm từ file product.csv!")
    finally:
        db.close()

if __name__ == "__main__":
    try:
        seed_products()
    except Exception as e:
        print(f"[SEED ERROR] Lỗi tổng quát khi seed: {e}")
