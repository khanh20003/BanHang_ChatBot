import sqlite3
import os

DB_PATH = 'backend/sql_app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'sql_app.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Thêm sản phẩm giảm giá cho nhiều brand
products = [
    # Samsung
    ('Samsung Galaxy A35 5G', 9000000, 'a35.png', 'Samsung Galaxy A35 5G giảm giá, pin trâu, màn 120Hz.', 20, 'active', 'flash_sale', 'sale', 7900000, 4.6, 1, 1),
    # Apple
    ('iPhone 15 Pro Max', 35000000, 'ip15promax.png', 'iPhone 15 Pro Max giảm giá, flagship Apple, pin trâu.', 10, 'active', 'flash_sale', 'sale', 32500000, 4.9, 1, 2),
    # Oppo
    ('Oppo Reno 11 F', 9000000, 'reno11f.png', 'Oppo Reno 11 F flash sale, pin khoẻ, camera đẹp.', 15, 'active', 'flash_sale', 'sale', 8500000, 4.7, 1, 3),
    # Xiaomi
    ('Xiaomi Redmi Note 13', 7000000, 'redmi13.png', 'Xiaomi Redmi Note 13 flash sale, pin trâu, màn 120Hz.', 18, 'active', 'flash_sale', 'sale', 6500000, 4.5, 1, 4),
    # Realme
    ('Realme 12 Pro', 8000000, 'realme12pro.png', 'Realme 12 Pro flash sale, pin khoẻ, camera tốt.', 12, 'active', 'flash_sale', 'sale', 7500000, 4.4, 1, 5),
]
for p in products:
    cursor.execute("SELECT COUNT(*) FROM products WHERE title=?", (p[0],))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO products (title, price, image, short_description, stock, status, product_type, tag, currentPrice, rating, category_id, brand_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

conn.commit()
conn.close()
print('✅ Đã bổ sung sản phẩm giảm giá cho nhiều brand!')
