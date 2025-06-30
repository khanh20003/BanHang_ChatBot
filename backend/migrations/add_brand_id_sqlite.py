import sqlite3
import os

# Đường dẫn tới file database SQLite
DB_PATH = 'backend/sql_app.db'

if not os.path.exists(DB_PATH):
    DB_PATH = 'sql_app.db'

conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Thêm cột brand_id nếu chưa có
try:
    cursor.execute("ALTER TABLE products ADD COLUMN brand_id INTEGER REFERENCES brands(id);")
    print("✅ Đã thêm cột brand_id vào bảng products!")
except Exception as e:
    print(f"[ERROR] {e}")

conn.commit()
conn.close()
