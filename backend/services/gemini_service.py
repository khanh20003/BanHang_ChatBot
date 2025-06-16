import os
import google.generativeai as genai
from dotenv import load_dotenv
from google.protobuf.json_format import MessageToDict

# Load biến môi trường .env
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise Exception("❌ GEMINI_API_KEY chưa được khai báo trong .env")

# Khởi tạo Gemini
genai.configure(api_key=GEMINI_API_KEY)

# Hàm trả lời chat thông thường
def generate_gemini_response(message: str) -> str:
    try:
        # ✅ DÙNG MODEL CÓ SẴN
        model = genai.GenerativeModel(model_name='gemini-1.5-flash')
        prompt = (
            f"Bạn là nhân viên bán hàng điện tử, hãy tư vấn ngắn gọn, thân thiện, chuyên nghiệp.\n\n"
            f"Khách hàng hỏi: {message}\n\nTrả lời:"
        )
        response = model.generate_content(prompt)
        if hasattr(response, 'text') and response.text:
            return response.text
        return "Xin lỗi, tôi không thể trả lời câu hỏi này lúc này."
    except Exception as e:
        print(f"[generate_gemini_response] Error: {e}")
        return "Xin lỗi, đã xảy ra lỗi. Vui lòng thử lại."

# Hàm gọi Gemini function calling
def call_gemini_function_calling(function_schema, user_message, context=None, generation_config=None):
    """
    Gọi Gemini function calling.
    Args:
        - function_schema: list[dict] mô tả tools
        - user_message: câu hỏi của user
        - context: (optional) ngữ cảnh bổ sung
        - generation_config: (optional) custom config
    Returns:
        - raw response object
    """
    try:
        # ✅ DÙNG MODEL CÓ SẴN
        model = genai.GenerativeModel(
            model_name='gemini-1.5-flash',
            tools=function_schema
        )
        chat = model.start_chat(history=[])
        # Bổ sung context hướng dẫn Gemini ưu tiên function_call
        smart_context = (
            "Bạn là trợ lý bán hàng điện tử. Nếu người dùng hỏi về sản phẩm, điện thoại, laptop, phụ kiện, ... "
            "hãy luôn trả về function_call search_products với các trường filter phù hợp (name, category, price, status, flash_sale, ...), "
            "không trả về text thông thường nếu có thể. Nếu không đủ thông tin filter, hãy hỏi lại user để lấy đủ filter."
        )
        full_context = smart_context if not context else f"{smart_context}\n\n{context}"
        prompt = f"{full_context}\n\n{user_message}"
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
        print(f"[call_gemini_function_calling] Error: {e}")
        return None
