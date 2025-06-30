from sqlalchemy import create_engine, MetaData, Table, Column, Integer, ForeignKey

# Thay đổi đường dẫn DB nếu cần
db_url = 'sqlite:///../sql_app.db'
engine = create_engine(db_url)
metadata = MetaData()
metadata.reflect(bind=engine)

products = metadata.tables['products']

# Thêm cột brand_id nếu chưa có
if 'brand_id' not in products.c:
    with engine.connect() as conn:
        conn.execute('ALTER TABLE products ADD COLUMN brand_id INTEGER REFERENCES brands(id)')
        print('✅ Đã thêm cột brand_id vào bảng products!')
else:
    print('Cột brand_id đã tồn tại trong bảng products.')
