import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load biến môi trường từ .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("❌ GEMINI_API_KEY chưa được khai báo trong .env")

# Cấu hình Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Kiểm tra key Gemini hợp lệ khi khởi động server
try:
    test_model = genai.GenerativeModel(model_name="gemini-1.5-flash")
    # Thử gọi một request rất nhỏ để xác thực key
    _ = test_model.generate_content("ping", generation_config={"max_output_tokens": 1})
    print("[Gemini API] ✅ API key hợp lệ và sẵn sàng sử dụng.")
except Exception as e:
    print(f"[Gemini API] ❌ API key không hợp lệ hoặc đã hết hạn/quota: {e}")

# Quản lý trạng thái quota để tránh spam API khi đã hết quota
quota_exceeded = False
_last_gemini_api_key = GEMINI_API_KEY

# ⚙️ Hàm dùng chung tạo model
def get_model(tools=None):
    global quota_exceeded, _last_gemini_api_key, GEMINI_API_KEY
    # Tự động reset quota_exceeded nếu key đã đổi
    current_key = os.getenv("GEMINI_API_KEY")
    if current_key != _last_gemini_api_key:
        print("[Gemini API] Đã phát hiện đổi API KEY, reset quota_exceeded và reload key mới.")
        quota_exceeded = False
        GEMINI_API_KEY = current_key
        genai.configure(api_key=GEMINI_API_KEY)
        _last_gemini_api_key = current_key
    if quota_exceeded:
        print("[Gemini API] Đã hết quota, không gọi API nữa cho đến khi reset hoặc đổi key.")
        return None
    try:
        return genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            tools=tools if tools else None
        )
    except Exception as e:
        print(f"[get_model] Error: {e}")
        return None

# ✅ Phát hiện ý định người dùng có đang hỏi mua sản phẩm hay không
def detect_product_intent(message: str) -> bool:
    """
    Xác định ý định mua hàng bằng AI Gemini (không dùng keyword cứng).
    Trả về True nếu là ý định mua hàng, False nếu là hỏi thông tin chung/xã giao.
    Nếu gặp lỗi quota, key hoặc timeout, sẽ fallback trả về False (không phải ý định mua hàng).
    """
    global quota_exceeded
    prompt = f'''
Bạn là AI phân loại ý định mua hàng cho chatbot bán hàng điện tử. Câu hỏi: "{message}"
- Nếu liên quan đến tìm, xem, so sánh, mua, hỏi giá, hỏi khuyến mãi, hỏi sản phẩm,... thì trả lời: YES
- Nếu liên quan đến thông tin ngoài sản phẩm (liên hệ, trụ sở, bảo hành, tuyển dụng, chính sách...) hoặc xã giao thì trả lời: NO
Chỉ trả lời đúng một từ: YES hoặc NO.
'''.strip()
    try:
        model = get_model()
        if not model:
            print("[detect_product_intent] Model init failed (key lỗi hoặc quota)")
            return False
        response = model.generate_content(prompt)
        answer = response.text.strip().upper()
        return answer == "YES"
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "quota" in err_str.lower():
            quota_exceeded = True
            print("[Gemini API] ❌ Đã vượt quá quota, tạm ngừng gọi Gemini cho đến khi reset/quota mới.")
        else:
            print(f"[detect_product_intent] Error: {e}")
        return False

# ✅ Sinh câu trả lời AI dựa trên message + context
def generate_gemini_response(message: str, context: dict = None) -> str:
    """
    Sinh câu trả lời tự nhiên, thân thiện dựa vào câu hỏi và ngữ cảnh.
    Nếu có danh sách sản phẩm hoặc gợi ý hành động, sẽ bổ sung vào prompt.
    Nếu gặp lỗi quota, key hoặc timeout, sẽ trả về thông báo fallback cho user.
    """
    global quota_exceeded
    try:
        model = get_model()
        if not model:
            return "Xin lỗi, hệ thống AI đang quá tải hoặc key/quota không hợp lệ. Vui lòng thử lại sau hoặc liên hệ nhân viên hỗ trợ."
        product_text = ""
        action_text = ""
        if context:
            product_list = context.get("products", [])
            if product_list:
                product_text += "\n\nDanh sách sản phẩm gợi ý:\n" + "\n".join(
                    [f"- {p.get('title')} (giá: {p.get('currentPrice', p.get('price'))}₫)" for p in product_list]
                )
            actions = context.get("actions")
            if actions:
                action_text = f"\n\nHành động gợi ý: {actions}"
        prompt = (
            f"Bạn là nhân viên tư vấn bán hàng điện tử.\n"
            f"Hãy trả lời thật thân thiện, đúng trọng tâm, tránh chào hỏi thừa.\n"
            f"Khách hàng hỏi: {message}\n"
            f"{context.get('response', '') if context else ''}"
            f"{product_text}{action_text}\n"
            f"Nếu không có sản phẩm phù hợp, hãy gợi ý nhóm sản phẩm nổi bật hoặc hỏi lại nhu cầu khách hàng.\n"
            f"Trả lời:"
        )
        response = model.generate_content(prompt)
        return response.text.strip() if response and response.text else "Xin lỗi, tôi chưa thể trả lời lúc này."
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "quota" in err_str.lower():
            quota_exceeded = True
            print("[Gemini API] ❌ Đã vượt quá quota, tạm ngừng gọi Gemini cho đến khi reset/quota mới.")
            return "Xin lỗi, hệ thống AI đã hết lượt miễn phí hoặc quota. Vui lòng thử lại sau hoặc liên hệ nhân viên hỗ trợ để cập nhật key mới."
        else:
            print(f"[generate_gemini_response] Error: {e}")
            return "Xin lỗi, hệ thống AI đang quá tải hoặc hết lượt miễn phí. Vui lòng thử lại sau hoặc liên hệ nhân viên hỗ trợ."

# ✅ Gọi Gemini với function calling để quyết định nên gọi search_products
def call_gemini_function_calling(function_schema, user_message, context=None, generation_config=None):
    """
    Gọi Gemini để kiểm tra xem có nên gọi function_call (ví dụ: search_products).
    Trả về raw response Gemini.
    """
    global quota_exceeded
    try:
        model = get_model(tools=function_schema)
        if not model:
            print("[call_gemini_function_calling] Model init failed (key lỗi hoặc quota)")
            return None
        chat = model.start_chat(history=[])

        smart_context = (
            "Bạn là trợ lý bán hàng điện tử.\n"
            "Nếu người dùng hỏi về sản phẩm (giá, khuyến mãi, sản phẩm mới, thương hiệu...), hãy gọi function_call `search_products`.\n"
            "Nếu họ hỏi thông tin khác (liên hệ, địa chỉ, trụ sở...), không cần gọi function_call.\n"
        )

        prompt = f"{smart_context}\nCâu hỏi: {user_message}"

        response = chat.send_message(
            prompt,
            generation_config=generation_config or {
                "temperature": 0.7,
                "top_p": 0.8,
                "top_k": 40
            }
        )
        return response
    except Exception as e:
        err_str = str(e)
        if "429" in err_str or "quota" in err_str.lower():
            quota_exceeded = True
            print("[Gemini API] ❌ Đã vượt quá quota, tạm ngừng gọi Gemini cho đến khi reset/quota mới.")
        else:
            print(f"[call_gemini_function_calling] Error: {e}")
        return None
