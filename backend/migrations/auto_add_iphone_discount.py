import sqlite3
import os

DB_PATH = 'backend/sql_app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'sql_app.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Thêm sản phẩm iPhone giảm giá nếu chưa có
iphone_discount_products = [
    ('iPhone 15 Pro Max', 35000000, 'ip15promax.png', 'iPhone 15 Pro Max giảm giá, flagship Apple, pin trâu.', 10, 'active', 'flash_sale', 'sale', 32500000, 4.9, 1, 2),
    ('iPhone 14', 20000000, 'ip14.png', 'iPhone 14 giảm giá, hiệu năng mạnh, camera tốt.', 15, 'active', 'flash_sale', 'sale', 18500000, 4.7, 1, 2),
]
for p in iphone_discount_products:
    cursor.execute("SELECT COUNT(*) FROM products WHERE title=?", (p[0],))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO products (title, price, image, short_description, stock, status, product_type, tag, currentPrice, rating, category_id, brand_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

conn.commit()
conn.close()
print('✅ Đã tự động bổ sung sản phẩm iPhone giảm giá!')
