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

# Hàm trả lời chat thông thường, bổ sung context nếu có
def generate_gemini_response(message: str, context: dict = None) -> str:
    try:
        model = genai.GenerativeModel(model_name='gemini-1.5-flash')
        # Xây dựng prompt linh hoạt, không ép chào hỏi, tập trung vào tư vấn tự nhiên
        if context:
            product_list = context.get('products')
            product_text = ""
            if product_list:
                product_text = "\n\nDanh sách sản phẩm phù hợp cho khách hàng (nếu có):\n" + "\n".join([
                    f"- {p.get('title', '')} (giá: {p.get('currentPrice', p.get('price', ''))}₫)" for p in product_list
                ])
            actions = context.get('actions')
            action_text = f"\n\nHành động gợi ý: {actions}" if actions else ""
            # Không ép chào hỏi, chỉ nhấn mạnh trả lời tự nhiên, đúng trọng tâm, có thể hỏi lại khách nếu cần
            prompt = (
                f"Bạn là nhân viên tư vấn bán hàng điện tử. Hãy trả lời thật tự nhiên, thân thiện, đúng trọng tâm, tránh lặp lại câu chào hỏi nếu không cần thiết.\n"
                f"Khách hàng hỏi: {message}\n"
                f"Kết quả phân tích logic hệ thống (nếu có):\n{context.get('response', '')}{product_text}{action_text}\n"
                f"Nếu không có sản phẩm phù hợp, hãy tư vấn tự nhiên, gợi ý nhóm sản phẩm nổi bật hoặc hỏi lại khách hàng về nhu cầu cụ thể.\n"
                f"Chỉ chào hỏi khi thực sự cần thiết (ví dụ: lần đầu trò chuyện).\n"
                f"Trả lời:"
            )
        else:
            prompt = (
                f"Bạn là nhân viên tư vấn bán hàng điện tử. Hãy trả lời thật tự nhiên, thân thiện, đúng trọng tâm, tránh lặp lại câu chào hỏi nếu không cần thiết.\n"
                f"Khách hàng hỏi: {message}\n\nTrả lời:"
            )
        response = model.generate_content(prompt)
        if hasattr(response, 'text') and response.text:
            return response.text.strip()
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
        # Bổ sung context hướng dẫn Gemini ưu tiên function_call hợp lý
        smart_context = (
            "Bạn là trợ lý bán hàng điện tử. "
            "Nếu người dùng hỏi về sản phẩm (ví dụ: 'còn iPhone không', 'có laptop Dell không', 'còn hàng Samsung không', 'sản phẩm mới nhất', 'giá rẻ', 'điện thoại samsung', 'laptop dưới 10 triệu', v.v.), hãy luôn gọi function_call search_products với filter đơn giản nhất có thể (ví dụ: chỉ tên sản phẩm hoặc loại sản phẩm, hoặc status, giá, v.v.). "
            "Trả về một danh sách tiêu biểu các sản phẩm hiện có trong kho phù hợp với yêu cầu đó. "
            "Nếu kết quả quá nhiều, có thể gợi ý thêm cho khách hàng về mức giá, dung lượng, đời máy... để lọc tiếp. "
            "Nếu người dùng hỏi về kiến thức chung, hãng lớn (Apple, Samsung, v.v.) hoặc hỏi xã giao (ví dụ: 'trụ sở iPhone ở đâu', 'chào bạn'), hãy trả lời tự nhiên bằng kiến thức của bạn, không gọi function_call. "
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
