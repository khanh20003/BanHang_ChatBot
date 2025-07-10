import psycopg2
import os
import subprocess
import sys

# Lấy DATABASE_URL từ file .env ở thư mục gốc workspace
from dotenv import load_dotenv
WORKSPACE_DIR = os.path.dirname(os.path.abspath(__file__))
ENV_PATH = os.path.join(WORKSPACE_DIR, '.env')
if not os.path.exists(ENV_PATH):
    print(f'Không tìm thấy file .env tại {ENV_PATH}')
    sys.exit(1)
load_dotenv(ENV_PATH)
DATABASE_URL = os.getenv('DATABASE_URL')
if not DATABASE_URL:
    print('Không tìm thấy DATABASE_URL trong file .env')
    sys.exit(1)

# Xóa toàn bộ bảng trong database PostgreSQL
try:
    conn = psycopg2.connect(DATABASE_URL)
    conn.autocommit = True
    cur = conn.cursor()
    cur.execute('DROP SCHEMA public CASCADE; CREATE SCHEMA public;')
    cur.close()
    conn.close()
    print('Đã xóa toàn bộ bảng trong database.')
except Exception as e:
    print(f'Lỗi khi xóa database: {e}')
    sys.exit(1)

# Chạy lại toàn bộ migration từ thư mục gốc
try:
    subprocess.run(['alembic', '-c', 'backend/alembic.ini', 'upgrade', 'head'], check=True, cwd=WORKSPACE_DIR)
    print('Đã migrate lại database thành công!')
except subprocess.CalledProcessError as e:
    print(f'Lỗi khi migrate: {e}')
    sys.exit(1)

print('Hoàn tất reset và migrate database PostgreSQL!')
