import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from backend.database.database import Base, engine, SessionLocal
from backend.database.seeder import seed_products

def reset_database():
    print("Bắt đầu reset database...")
    
    # Xóa tất cả bảng
    Base.metadata.drop_all(bind=engine)
    print("Đã xóa tất cả bảng")
    
    # Tạo lại các bảng
    Base.metadata.create_all(bind=engine)
    print("Đã tạo lại các bảng")
    
    # Seed dữ liệu mẫu
    db = SessionLocal()
    try:
        seed_products(db)
        print("Đã seed dữ liệu mẫu thành công!")
    except Exception as e:
        print(f"Lỗi khi seed dữ liệu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    reset_database() 