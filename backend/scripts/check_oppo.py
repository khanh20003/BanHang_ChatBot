import sqlite3
conn = sqlite3.connect('backend/sql_app.db')
c = conn.cursor()
rows = c.execute("SELECT id, title, price, status FROM products WHERE lower(title) LIKE '%oppo%' OR lower(short_description) LIKE '%oppo%';").fetchall()
for row in rows:
    print(row)
conn.close()
