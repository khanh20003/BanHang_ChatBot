import sys, os; sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from sqlalchemy import text
from module.database import SessionLocal
from module import models

def reset_products():
    db = SessionLocal()
    try:
        # Xóa dữ liệu order_items trước
        db.execute(text('DELETE FROM order_items'))
        db.commit()
        # Sau đó xóa products
        db.query(models.Product).delete()
        db.commit()
        print("Đã xóa sạch bảng order_items và products!")
    except Exception as e:
        print(f"Lỗi khi xóa bảng products/order_items: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_products()
