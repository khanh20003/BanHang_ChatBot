from sqlalchemy import create_engine
from sqlalchemy.sql import text
from database.database import DATABASE_URL

def upgrade():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        # Tạo bảng categories nếu chưa tồn tại
        conn.execute(text("""
            CREATE TABLE IF NOT EXISTS categories (
                id SERIAL PRIMARY KEY,
                title VARCHAR(255) NOT NULL,
                image VARCHAR(500)
            )
        """))
        
        # Thêm cột category_id nếu chưa tồn tại
        conn.execute(text("""
            ALTER TABLE products 
            ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id)
        """))
        
        # Xóa cột category cũ nếu tồn tại
        conn.execute(text("""
            ALTER TABLE products 
            DROP COLUMN IF EXISTS category
        """))
        
        conn.commit() 