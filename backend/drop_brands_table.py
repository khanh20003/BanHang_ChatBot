from sqlalchemy import create_engine, text

engine = create_engine('postgresql://postgres:123456@localhost:5432/Web_chatbot')
with engine.connect() as conn:
    conn.execute(text('DROP TABLE IF EXISTS brands CASCADE;'))
    conn.commit()
print('✅ Đã drop bảng brands!')
