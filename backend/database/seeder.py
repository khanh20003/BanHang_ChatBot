# database/seeder.py
from sqlalchemy.orm import Session
from models.content_models import Product
import random
from datetime import datetime

def seed_products(db: Session):
    """Seed sample product data"""
    
    # Xóa dữ liệu cũ
    db.query(Product).delete()
    
    # Danh sách sản phẩm mẫu
    products = [
        # Điện thoại
        {
            "title": "iPhone 15 Pro Max",
            "image": "https://cdn.tgdd.vn/Products/Images/42/251192/iphone-15-pro-max-natural-titanium-thumb-600x600.jpg",
            "price": 34990000,
            "currentPrice": 32990000,
            "status": "newest",
            "product": "newest",
            "stock": 50,
            "category_id": 1,
            "tag": "new",
            "short_description": "iPhone 15 Pro Max mới nhất với chip A17 Pro, camera 48MP"
        },
        {
            "name": "Samsung Galaxy S24 Ultra",
            "price": 29990000,
            "current_price": 29990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/42/307621/samsung-galaxy-s24-ultra-thumb-xanh-600x600.jpg",
            "description": "Samsung Galaxy S24 Ultra với AI tích hợp, camera 200MP",
            "rating": 4.7,
            "stock": 45,
            "status": "newest",
            "category": "smartphone"
        },
        {
            "name": "Xiaomi 14 Pro",
            "price": 19990000,
            "current_price": 17990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/42/307621/xiaomi-14-pro-thumb-600x600.jpg",
            "description": "Xiaomi 14 Pro với camera Leica, chip Snapdragon 8 Gen 3",
            "rating": 4.6,
            "stock": 30,
            "status": "trending",
            "category": "smartphone"
        },
        {
            "name": "OPPO Find X7 Ultra",
            "price": 24990000,
            "current_price": 22990000,
            "image_url": "https://example.com/oppo-x7.jpg",
            "description": "OPPO Find X7 Ultra với camera Hasselblad, chip Dimensity 9300",
            "rating": 4.7,
            "stock": 35,
            "status": "trending",
            "category": "smartphone"
        },
        {
            "name": "Vivo X100 Pro",
            "price": 22990000,
            "current_price": 20990000,
            "image_url": "https://example.com/vivo-x100.jpg",
            "description": "Vivo X100 Pro với camera Zeiss, chip Dimensity 9300",
            "rating": 4.6,
            "stock": 40,
            "status": "newest",
            "category": "smartphone"
        },
        
        # Laptop
        {
            "name": "MacBook Pro M3",
            "price": 45990000,
            "current_price": 43990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/44/282885/macbook-pro-m3-14-inch-2023-thumb-600x600.jpg",
            "description": "MacBook Pro với chip M3, màn hình Liquid Retina XDR",
            "rating": 4.9,
            "stock": 25,
            "status": "newest",
            "category": "laptop"
        },
        {
            "name": "Dell XPS 15",
            "price": 39990000,
            "current_price": 37990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/44/282885/dell-xps-15-2023-thumb-600x600.jpg",
            "description": "Dell XPS 15 với màn hình OLED, Intel Core i9",
            "rating": 4.7,
            "stock": 20,
            "status": "best_seller",
            "category": "laptop"
        },
        {
            "name": "Asus ROG Strix G16",
            "price": 29990000,
            "current_price": 27990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/44/282885/asus-rog-strix-g16-2023-thumb-600x600.jpg",
            "description": "Laptop gaming với RTX 4070, Intel Core i7",
            "rating": 4.8,
            "stock": 15,
            "status": "trending",
            "category": "laptop"
        },
        {
            "name": "Lenovo ThinkPad X1 Carbon",
            "price": 35990000,
            "current_price": 33990000,
            "image_url": "https://example.com/thinkpad.jpg",
            "description": "ThinkPad X1 Carbon với Intel Core i7, màn hình OLED",
            "rating": 4.8,
            "stock": 18,
            "status": "best_seller",
            "category": "laptop"
        },
        {
            "name": "MSI Stealth 16",
            "price": 42990000,
            "current_price": 39990000,
            "image_url": "https://example.com/msi.jpg",
            "description": "MSI Stealth 16 với RTX 4080, Intel Core i9",
            "rating": 4.7,
            "stock": 12,
            "status": "trending",
            "category": "laptop"
        },
        
        # Tablet
        {
            "name": "iPad Pro M2",
            "price": 29990000,
            "current_price": 27990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/522/282885/ipad-pro-m2-11-inch-wifi-thumb-600x600.jpg",
            "description": "iPad Pro với chip M2, màn hình Liquid Retina",
            "rating": 4.8,
            "stock": 40,
            "status": "best_seller",
            "category": "tablet"
        },
        {
            "name": "Samsung Galaxy Tab S9 Ultra",
            "price": 24990000,
            "current_price": 22990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/522/282885/samsung-galaxy-tab-s9-ultra-thumb-600x600.jpg",
            "description": "Galaxy Tab S9 Ultra với S Pen, màn hình AMOLED",
            "rating": 4.7,
            "stock": 35,
            "status": "trending",
            "category": "tablet"
        },
        {
            "name": "Xiaomi Pad 6 Pro",
            "price": 15990000,
            "current_price": 13990000,
            "image_url": "https://example.com/xiaomi-pad.jpg",
            "description": "Xiaomi Pad 6 Pro với Snapdragon 8+ Gen 1, màn hình 144Hz",
            "rating": 4.6,
            "stock": 45,
            "status": "trending",
            "category": "tablet"
        },
        
        # Smartwatch
        {
            "name": "Apple Watch Series 9",
            "price": 9990000,
            "current_price": 8990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/7077/282885/apple-watch-series-9-thumb-600x600.jpg",
            "description": "Apple Watch Series 9 với chip S9, tính năng Double Tap",
            "rating": 4.8,
            "stock": 60,
            "status": "newest",
            "category": "smartwatch"
        },
        {
            "name": "Samsung Galaxy Watch 6",
            "price": 7990000,
            "current_price": 6990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/7077/282885/samsung-galaxy-watch-6-thumb-600x600.jpg",
            "description": "Galaxy Watch 6 với Wear OS, màn hình AMOLED",
            "rating": 4.6,
            "stock": 50,
            "status": "best_seller",
            "category": "smartwatch"
        },
        {
            "name": "Garmin Fenix 7",
            "price": 15990000,
            "current_price": 14990000,
            "image_url": "https://example.com/garmin.jpg",
            "description": "Garmin Fenix 7 với GPS, theo dõi sức khỏe chuyên nghiệp",
            "rating": 4.7,
            "stock": 30,
            "status": "trending",
            "category": "smartwatch"
        },
        
        # Phụ kiện
        {
            "name": "Apple AirPods Pro 2",
            "price": 6990000,
            "current_price": 5990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/54/282885/airpods-pro-2-thumb-600x600.jpg",
            "description": "AirPods Pro 2 với chip H2, chống ồn chủ động",
            "rating": 4.7,
            "stock": 100,
            "status": "best_seller",
            "category": "accessories"
        },
        {
            "name": "Apple AirPods Max",
            "price": 12990000,
            "current_price": 11990000,
            "image_url": "https://cdn.tgdd.vn/Products/54/282885/apple-airpods-max-thumb-600x600.jpg",
            "description": "AirPods Max với thiết kế cao cấp, âm thanh không gian",
            "rating": 4.8,
            "stock": 50,
            "status": "trending",
            "category": "accessories"
        },
        {
            "name": "Apple MagSafe Charger",
            "price": 1990000,
            "current_price": 1790000,
            "image_url": "https://cdn.tgdd.vn/Products/54/282885/apple-magsafe-charger-thumb-600x600.jpg",
            "description": "Sạc không dây MagSafe cho iPhone",
            "rating": 4.6,
            "stock": 80,
            "status": "best_seller",
            "category": "accessories"
        },
        {
            "name": "Apple 20W USB-C Power Adapter",
            "price": 990000,
            "current_price": 890000,
            "image_url": "https://cdn.tgdd.vn/Products/54/282885/apple-20w-usb-c-power-adapter-thumb-600x600.jpg",
            "description": "Củ sạc nhanh 20W cho iPhone và iPad",
            "rating": 4.7,
            "stock": 120,
            "status": "best_seller",
            "category": "accessories"
        },
        {
            "name": "Apple AirTag",
            "price": 790000,
            "current_price": 690000,
            "image_url": "https://cdn.tgdd.vn/Products/54/282885/apple-airtag-thumb-600x600.jpg",
            "description": "Thiết bị định vị thông minh từ Apple",
            "rating": 4.5,
            "stock": 90,
            "status": "trending",
            "category": "accessories"
        },
        
        # Camera
        {
            "name": "Sony A7 IV",
            "price": 45990000,
            "current_price": 43990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/sony-a7-iv-thumb-600x600.jpg",
            "description": "Máy ảnh Sony A7 IV full-frame, 33MP",
            "rating": 4.8,
            "stock": 15,
            "status": "best_seller",
            "category": "camera"
        },
        {
            "name": "Canon EOS R6 Mark II",
            "price": 39990000,
            "current_price": 37990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/canon-eos-r6-mark-ii-thumb-600x600.jpg",
            "description": "Máy ảnh Canon EOS R6 Mark II mirrorless",
            "rating": 4.7,
            "stock": 20,
            "status": "trending",
            "category": "camera"
        },
        
        # Gaming
        {
            "name": "PlayStation 5",
            "price": 12990000,
            "current_price": 11990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/playstation-5-thumb-600x600.jpg",
            "description": "PlayStation 5 với DualSense, SSD 825GB",
            "rating": 4.9,
            "stock": 30,
            "status": "best_seller",
            "category": "gaming"
        },
        {
            "name": "Xbox Series X",
            "price": 11990000,
            "current_price": 10990000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/xbox-series-x-thumb-600x600.jpg",
            "description": "Xbox Series X với Game Pass, 1TB SSD",
            "rating": 4.8,
            "stock": 25,
            "status": "trending",
            "category": "gaming"
        },
        
        # Smart Home
        {
            "name": "Google Nest Hub 2",
            "price": 3990000,
            "current_price": 3490000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/google-nest-hub-2-thumb-600x600.jpg",
            "description": "Google Nest Hub 2 với màn hình 7 inch, Google Assistant",
            "rating": 4.6,
            "stock": 50,
            "status": "trending",
            "category": "smart_home"
        },
        {
            "name": "Amazon Echo Show 10",
            "price": 5990000,
            "current_price": 5490000,
            "image_url": "https://cdn.tgdd.vn/Products/Images/282885/amazon-echo-show-10-thumb-600x600.jpg",
            "description": "Amazon Echo Show 10 với màn hình 10 inch, Alexa",
            "rating": 4.7,
            "stock": 40,
            "status": "best_seller",
            "category": "smart_home"
        }
    ]
    
    # Thêm sản phẩm vào database
    for product_data in products:
        product = Product(**product_data)
        db.add(product)
    
    db.commit()
    print("Đã thêm dữ liệu mẫu thành công!")
