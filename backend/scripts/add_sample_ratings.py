import sqlite3
import random

# Kết nối tới database
conn = sqlite3.connect('sql_app.db')
c = conn.cursor()

# Lấy danh sách sản phẩm
c.execute('SELECT id FROM products')
products = c.fetchall()

# Gán rating ngẫu nhiên cho mỗi sản phẩm
for (pid,) in products:
    rating = round(random.uniform(3.5, 5.0), 1)
    c.execute('UPDATE products SET rating = ? WHERE id = ?', (rating, pid))

conn.commit()
conn.close()
print('Đã cập nhật rating mẫu cho tất cả sản phẩm!')
