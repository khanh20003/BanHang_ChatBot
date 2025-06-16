from sqlalchemy import create_engine, Column, Integer
from sqlalchemy.sql import text
from module.database import SQLALCHEMY_DATABASE_URL

def upgrade():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        # Add stock column with default value 0
        conn.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS stock INTEGER DEFAULT 0"))
        conn.commit()

def downgrade():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    with engine.connect() as conn:
        # Remove stock column
        conn.execute(text("ALTER TABLE products DROP COLUMN IF EXISTS stock"))
        conn.commit()

if __name__ == "__main__":
    upgrade() 