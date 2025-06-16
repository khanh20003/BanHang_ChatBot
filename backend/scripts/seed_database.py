import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database.database import SessionLocal
from database.seeder import seed_products

def main():
    print("Bắt đầu đổ dữ liệu mẫu...")
    db = SessionLocal()
    try:
        seed_products(db)
        print("Đã đổ dữ liệu mẫu thành công!")
    except Exception as e:
        print(f"Lỗi khi đổ dữ liệu: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    main() 