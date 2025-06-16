# Web Chatbot Bán Hàng

Đây là một dự án web chatbot bán hàng được xây dựng bằng FastAPI.

## Cài đặt

1.  Tạo một môi trường ảo (khuyến nghị):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  Cài đặt các thư viện cần thiết:
    ```bash
    pip install -r requirements.txt
    ```

3.  Cấu hình biến môi trường:
    Tạo một file `.env` ở thư mục gốc của dự án và thêm các biến môi trường cần thiết, ví dụ:
    ```
    OPENAI_API_KEY="your_openai_api_key_here"
    DATABASE_URL="postgresql://user:password@host:port/dbname"
    ```

## Chạy ứng dụng

```bash
uvicorn main:app --reload --port 8000
```

Ứng dụng sẽ có sẵn tại `http://localhost:8000`. 

Bạn có thể truy cập API docs (Swagger UI) bằng đường dẫn sau trên trình duyệt của chính máy bạn:

- http://localhost:2225/docs
- http://127.0.0.1:2225/docs

> **Lưu ý:**  
> - `0.0.0.0` là địa chỉ lắng nghe trên tất cả các IP, nhưng bạn không thể truy cập trực tiếp bằng `http://0.0.0.0:2225` trên trình duyệt.  
> - Bạn phải dùng `localhost` hoặc `127.0.0.1` (hoặc IP thật của máy nếu truy cập từ máy khác trong mạng LAN).

---

### Tóm lại:
**Bạn hãy mở trình duyệt và truy cập:**
```
http://localhost:2225/docs
```

---

Nếu bạn vẫn không truy cập được, hãy gửi ảnh hoặc thông báo lỗi trên trình duyệt để mình hỗ trợ tiếp nhé! 