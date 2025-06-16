from sqlalchemy import create_engine, Column, String
from sqlalchemy.sql import text
from module.database import SQLALCHEMY_DATABASE_URL

def upgrade():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        # Add category column with default value 'Uncategorized'
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS category VARCHAR DEFAULT 'Uncategorized'"))
        conn.commit()

def downgrade():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        # Remove category column
        conn.execute(text("ALTER TABLE products DROP COLUMN IF EXISTS category"))
        conn.commit()

if __name__ == "__main__":
    upgrade() 