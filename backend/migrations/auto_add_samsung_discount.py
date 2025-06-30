import sqlite3
import os

DB_PATH = 'backend/sql_app.db'
if not os.path.exists(DB_PATH):
    DB_PATH = 'sql_app.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Thêm sản phẩm Samsung giảm giá nếu chưa có
samsung_discount_products = [
    ('Samsung Galaxy A35 5G', 9000000, 'a35.png', 'Samsung Galaxy A35 5G giảm giá, pin trâu, màn 120Hz.', 20, 'active', 'flash_sale', 'sale', 7900000, 4.6, 1, 1),
    ('Samsung Galaxy S24 FE', 15000000, 's24fe.png', 'Samsung Galaxy S24 FE giảm giá, màn hình lớn, pin khoẻ.', 15, 'active', 'flash_sale', 'sale', 13500000, 4.7, 1, 1),
]
for p in samsung_discount_products:
    cursor.execute("SELECT COUNT(*) FROM products WHERE title=?", (p[0],))
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO products (title, price, image, short_description, stock, status, product_type, tag, currentPrice, rating, category_id, brand_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, p)

conn.commit()
conn.close()
print('✅ Đã tự động bổ sung sản phẩm Samsung giảm giá!')
