from backend.database.database import SessionLocal
from backend.models.content_models import Product, Category

def add_trending_newest_products():
    db = SessionLocal()
    try:
        # Lấy category đầu tiên nếu có, hoặc None
        category = db.query(Category).first()
        # Thêm sản phẩm trending
        trending = Product(
            title="iPhone 15 Pro Max Trending",
            price=39990000,
            image="/static/images/iphone15pro_trending.jpg",
            short_description="iPhone 15 Pro Max bản trending, hot nhất 2025",
            stock=10,
            status="active",
            product_type="trending",
            tag="hot",
            currentPrice=37990000,
            category=category
        )
        # Thêm sản phẩm newest
        newest = Product(
            title="Samsung Galaxy S25 Newest",
            price=29990000,
            image="/static/images/galaxys25_newest.jpg",
            short_description="Samsung Galaxy S25 bản mới nhất 2025",
            stock=15,
            status="active",
            product_type="newest",
            tag="new",
            currentPrice=28990000,
            category=category
        )
        db.add(trending)
        db.add(newest)
        db.commit()
        print("Đã thêm sản phẩm trending và newest thành công!")
    except Exception as e:
        db.rollback()
        print(f"Lỗi khi thêm sản phẩm: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    add_trending_newest_products()
