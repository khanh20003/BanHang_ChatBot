from sqlalchemy import Column, Integer, String, MetaData, Table
from sqlalchemy import create_engine

# Thay đổi đường dẫn DB nếu cần
db_url = 'sqlite:///../sql_app.db'
engine = create_engine(db_url)
metadata = MetaData()

brands = Table(
    'brands', metadata,
    Column('id', Integer, primary_key=True, autoincrement=True),
    Column('title', String(255)),
    Column('logo', String(500)),
)

def upgrade():
    metadata.create_all(engine, tables=[brands])

def downgrade():
    brands.drop(engine)

if __name__ == '__main__':
    upgrade()
    print('✅ Đã tạo bảng brands!')
