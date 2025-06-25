import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend')))

from sqlalchemy.orm import sessionmaker
from sqlalchemy import create_engine
from models.content_models import Product, Category

# Thay đổi đường dẫn DB nếu cần
engine = create_engine('sqlite:///backend/sql_app.db')
Session = sessionmaker(bind=engine)
session = Session()

# Tìm hoặc tạo category 'Điện thoại'
category = session.query(Category).filter(Category.title.ilike('%điện thoại%')).first()
if not category:
    category = Category(title='Điện thoại', image='https://dummyimage.com/200x200/2196f3/fff&text=Điện+thoại')
    session.add(category)
    session.commit()

# Thêm sản phẩm Oppo mẫu
oppo = Product(
    title='Điện thoại Oppo Reno 11',
    price=7990000,
    image='https://dummyimage.com/300x300/00cc99/fff&text=Oppo+Reno+11',
    short_description='Oppo Reno 11, pin trâu, camera đẹp',
    stock=20,
    status='active',
    product_type='newest',
    tag='new',
    currentPrice=7490000,
    category_id=category.id
)
session.add(oppo)
session.commit()
print('Đã thêm sản phẩm Oppo mẫu!')
session.close()
