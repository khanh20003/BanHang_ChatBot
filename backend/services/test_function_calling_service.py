import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.content_models import Base, Product, Category, Brand
from services.function_calling_service import search_products
from services.constants import remove_accents

# Tạo database test in-memory
@pytest.fixture(scope="module")
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    # Seed brand
    brands = [Brand(title="Apple"), Brand(title="Samsung"), Brand(title="Xiaomi"), Brand(title="Realme")]
    session.add_all(brands)
    session.commit()
    # Seed category
    categories = [Category(title="Điện thoại"), Category(title="Laptop"), Category(title="Phụ kiện")]
    session.add_all(categories)
    session.commit()
    # Seed sản phẩm đa dạng
    products = [
        Product(title="iPhone 15 Pro Max", brand_id=brands[0].id, category_id=categories[0].id, product_type="newest", tag="", price=30000000, currentPrice=29000000, status="active", stock=10, rating=4.8),
        Product(title="Samsung Galaxy S24 Ultra", brand_id=brands[1].id, category_id=categories[0].id, product_type="best_seller", tag="giảm giá", price=25000000, currentPrice=22000000, status="active", stock=5, rating=4.7),
        Product(title="Xiaomi Redmi Note 13", brand_id=brands[2].id, category_id=categories[0].id, product_type="trending", tag="flash sale", price=7000000, currentPrice=6500000, status="active", stock=8, rating=4.5),
        Product(title="Realme C55", brand_id=brands[3].id, category_id=categories[0].id, product_type="", tag="", price=4000000, currentPrice=3900000, status="active", stock=12, rating=4.2),
        Product(title="Apple MacBook Air M2", brand_id=brands[0].id, category_id=categories[1].id, product_type="", tag="", price=25000000, currentPrice=24500000, status="active", stock=3, rating=4.9),
        Product(title="Samsung Galaxy Buds2", brand_id=brands[1].id, category_id=categories[2].id, product_type="", tag="", price=3000000, currentPrice=2800000, status="active", stock=7, rating=4.3),
    ]
    session.add_all(products)
    session.commit()
    yield session
    session.close()

# Test các intent đặc biệt và fallback
@pytest.mark.parametrize("query,expected_titles", [
    (dict(name="iPhone"), ["iPhone 15 Pro Max"]),
    (dict(name="Samsung"), ["Samsung Galaxy S24 Ultra", "Samsung Galaxy Buds2"]),
    (dict(name="điện thoại"), ["iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "Xiaomi Redmi Note 13", "Realme C55"]),
    (dict(name="macbook"), ["Apple MacBook Air M2"]),
    (dict(name="xiaomi"), ["Xiaomi Redmi Note 13"]),
    (dict(name="realme"), ["Realme C55"]),
    (dict(name="galaxy"), ["Samsung Galaxy S24 Ultra", "Samsung Galaxy Buds2"]),
    (dict(status="newest"), ["iPhone 15 Pro Max"]),
    (dict(status="best_seller"), ["Samsung Galaxy S24 Ultra"]),
    (dict(status="trending"), ["Xiaomi Redmi Note 13"]),
    (dict(name="giảm giá"), ["Samsung Galaxy S24 Ultra", "Xiaomi Redmi Note 13"]),
    (dict(name="flash sale"), ["Xiaomi Redmi Note 13"]),
    (dict(name="airpods"), []),  # Không có sản phẩm airpods
    (dict(name="iphone", category="laptop"), []),  # Không có iPhone laptop
    (dict(name="ipone"), ["iPhone 15 Pro Max"]),  # Sai chính tả nhẹ
    (dict(name="đien thoai"), ["iPhone 15 Pro Max", "Samsung Galaxy S24 Ultra", "Xiaomi Redmi Note 13", "Realme C55"]),  # Thiếu dấu
    (dict(name="Samsung", category="phụ kiện"), ["Samsung Galaxy Buds2"]),
    (dict(name="Samsung", category="laptop"), []),
    (dict(name="Apple", category="laptop"), ["Apple MacBook Air M2"]),
    (dict(name="Realme", status="trending"), []),
])
def test_search_products(db_session, query, expected_titles):
    results = search_products(db_session, query, limit=5)
    result_titles = [p.title for p in results]
    for title in expected_titles:
        assert title in result_titles, f"Expected '{title}' in results for query {query}, got {result_titles}"
    # Nếu không mong đợi sản phẩm nào thì kết quả phải rỗng
    if not expected_titles:
        assert not result_titles, f"Expected no results for query {query}, got {result_titles}"
