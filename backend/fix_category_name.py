import sqlite3

conn = sqlite3.connect('sql_app.db')
cur = conn.cursor()

# Thêm cột name nếu chưa có
try:
    cur.execute("ALTER TABLE categories ADD COLUMN name VARCHAR(255);")
    print("Đã thêm cột 'name' vào bảng categories.")
except Exception as e:
    print("Có thể cột 'name' đã tồn tại:", e)

# Copy dữ liệu từ title sang name nếu có cột title
try:
    cur.execute("UPDATE categories SET name = title;")
    print("Đã copy dữ liệu từ 'title' sang 'name'.")
except Exception as e:
    print("Không thể copy dữ liệu từ title sang name:", e)

conn.commit()
conn.close()
print("Hoàn tất cập nhật bảng categories.")
