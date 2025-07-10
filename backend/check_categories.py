import sqlite3

conn = sqlite3.connect('sql_app.db')
cur = conn.cursor()

print("\n--- Cấu trúc bảng categories ---")
cur.execute("PRAGMA table_info(categories);")
for col in cur.fetchall():
    print(col)

print("\n--- Dữ liệu bảng categories ---")
cur.execute("SELECT * FROM categories;")
for row in cur.fetchall():
    print(row)

conn.close()
print("\nKiểm tra xong!")
