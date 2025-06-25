from typing import Dict, Any
from datetime import datetime
import json
from google.protobuf.json_format import MessageToDict
from database.database import SessionLocal
from services.function_calling_service import search_products, extract_search_params
from services.gemini_service import call_gemini_function_calling
from models.content_models import Product
from rapidfuzz import process, fuzz

# ✅ Định nghĩa schema function để Gemini nhận biết
function_schema = [
    {
        "name": "search_products",
        "description": "Tìm kiếm sản phẩm theo các tiêu chí người dùng nhập. Luôn gọi function_call này nếu người dùng hỏi về sản phẩm, kể cả các truy vấn ngắn như 'sản phẩm mới nhất', 'giá rẻ', 'điện thoại samsung', v.v.",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "name": {"type": "STRING", "description": "Tên sản phẩm hoặc từ khóa tìm kiếm"},
                "min_price": {"type": "NUMBER", "description": "Giá tối thiểu"},
                "max_price": {"type": "NUMBER", "description": "Giá tối đa"},
                "status": {
                    "type": "STRING",
                    "enum": ["newest", "trending", "best_seller"],
                    "description": "Trạng thái sản phẩm: mới nhất, bán chạy, thịnh hành"
                },
                "category": {"type": "STRING", "description": "Danh mục sản phẩm"},
                "rating": {"type": "NUMBER", "description": "Đánh giá tối thiểu"},
                "is_flash_sale": {"type": "BOOLEAN", "description": "Chỉ lấy sản phẩm flash sale nếu true"},
                "in_stock": {"type": "BOOLEAN", "description": "Chỉ lấy sản phẩm còn hàng nếu true"}
            },
            "required": []
        }
    }
]


# Hàm này nhận object function_call (fc) mà Gemini trả về
# Mục đích: bóc tách phần args (params) từ fc để lấy ra các tham số lọc sản phẩm
# Vì fc là object phức tạp, chỉ phần args mới chứa thông tin cần thiết cho search_products
# Không truyền trực tiếp fc vào search_products, chỉ truyền params đã tách ra
def extract_gemini_args(fc):
    # Nếu args là dict (Gemini trả về dạng dict)
    if isinstance(fc.args, dict) and fc.args:
        return fc.args
    # Nếu args là object nhưng có __iter__ (có thể ép dict)
    try:
        d = dict(fc.args)
        if d:
            return d
    except Exception:
        pass
    # Nếu là protobuf message
    try:
        d = MessageToDict(fc.args)
        if d:
            return d
    except Exception:
        pass
    # Nếu là protobuf map
    params = {}
    if hasattr(fc.args, "fields"):
        fields_obj = fc.args.fields
        if hasattr(fields_obj, "items"):
            for k, v in fields_obj.items():
                kind = getattr(v, "kind", None)
                if kind and hasattr(v, kind):
                    value = getattr(v, kind)
                    if value not in (None, "", [], {}):
                        params[k] = value
        else:
            for k in fields_obj:
                v = fields_obj[k]
                kind = getattr(v, "kind", None)
                if kind and hasattr(v, kind):
                    value = getattr(v, kind)
                    if value not in (None, "", [], {}):
                        params[k] = value
    return params


def product_to_dict(p):
    return {
        "id": p.id,
        "title": p.title,
        "image": p.image,
        "price": float(p.price),
        "currentPrice": float(p.currentPrice) if p.currentPrice else None,
        "status": p.status,
        "stock": p.stock,
        "category": {
            "id": p.category.id,
            "title": p.category.title,
            "image": p.category.image if p.category else None
        } if p.category else None,
        "short_description": p.short_description,
        "product_type": p.product_type,
        "actions": [
            {"type": "add_to_cart", "label": "Đặt hàng", "product_id": p.id}
        ]
    }


def process_user_message(message: str, user_id: int) -> Dict[str, Any]:
    """
    Xử lý tin nhắn người dùng:
    - Gọi Gemini Function Calling với schema.
    - Nếu Gemini trả về function_call, lấy params và gọi search_products.
    - Nếu không có function_call, trả về câu trả lời tự nhiên.
    - Nếu không có params, fallback trending/newest.

    Args:
        message (str): Tin nhắn người dùng.
        user_id (int): ID người dùng.

    Returns:
        Dict[str, Any]: Kết quả gồm:
            - response: Câu trả lời văn bản.
            - products: Danh sách sản phẩm đã format JSON.
            - actions: Hành động khuyến nghị (nếu có).
    """
    db = SessionLocal()
    try:
        gemini_response = call_gemini_function_calling(function_schema, message)

        if hasattr(gemini_response, 'candidates'):
            for candidate in gemini_response.candidates:
                content = getattr(candidate, 'content', None)
                if content and hasattr(content, 'parts'):
                    for part in content.parts:
                        fc = None
                        if isinstance(part, dict) and 'function_call' in part:
                            fc = part['function_call']
                        elif not isinstance(part, dict) and hasattr(part, 'function_call') and part.function_call:
                            fc = part.function_call

                        if fc:
                            params = extract_gemini_args(fc)
                            # Nếu không có product_type, fallback extract_search_params để lấy đúng ý định
                            if not params or not params.get('product_type'):
                                params = extract_search_params(message)
                            # ✅ Dùng params này để gọi search_products trực tiếp
                            products = search_products(db, params, limit=10)

                            # Fallback mở rộng: nếu không có sản phẩm, ưu tiên trả về sản phẩm liên quan (fuzzy), nếu vẫn không có thì chỉ trả về trending/newest và luôn có chú thích rõ ràng
                            if not products:
                                # Fuzzy search sản phẩm liên quan
                                related_products = []
                                if params.get('name'):
                                    name = params['name'].strip().lower()
                                    all_products = db.query(Product).filter(Product.status == 'active').all()
                                    choices = [(f"{p.title} {p.short_description or ''}", p) for p in all_products]
                                    results = process.extract(name, [c[0] for c in choices], scorer=fuzz.WRatio, limit=5)
                                    related_titles = [r[0] for r in results if r[1] >= 60]
                                    related_products = [p for t, p in choices if t in related_titles]
                                if related_products:
                                    return {
                                        "response": "Không tìm thấy sản phẩm đúng yêu cầu, nhưng đây là một số sản phẩm liên quan để bạn tham khảo:",
                                        "products": [product_to_dict(p) for p in related_products],
                                        "actions": None
                                    }
                                # Nếu không có sản phẩm liên quan, trả về sản phẩm nổi bật (chỉ trending/newest) kèm chú thích rõ ràng
                                products = db.query(Product).filter(Product.product_type.in_(["trending", "newest"]))\
                                    .order_by(Product.id.desc()).limit(5).all()
                                return {
                                    "response": "Hiện tại chưa có sản phẩm đúng yêu cầu. Dưới đây là một số sản phẩm nổi bật (trending, mới nhất) để bạn tham khảo:",
                                    "products": [product_to_dict(p) for p in products],
                                    "actions": None
                                }

                            return {
                                "response": f"Tìm thấy {len(products)} sản phẩm phù hợp.",
                                "products": [product_to_dict(p) for p in products],
                                "actions": None
                            }

                        # Nếu part là text (trả về chat thường)
                        text = part.get('text') if isinstance(part, dict) else (getattr(part, 'text', None))
                        if text:
                            if "ready to assist" in text.lower() or "i will use the" in text.lower():
                                continue
                            try:
                                text_data = json.loads(text)
                                if isinstance(text_data, dict):
                                    return text_data
                            except Exception:
                                pass
                            return {
                                "response": text,
                                "products": [],
                                "actions": None,
                                "timestamp": datetime.now().isoformat()
                            }

        # ✅ Fallback: không có function_call → không có text → trả câu xin lỗi
        return {
            "response": "Xin lỗi, tôi chưa hiểu yêu cầu của bạn. Bạn có thể nói rõ hơn không?",
            "products": [],
            "actions": None,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        import traceback
        print(f"[ERROR] ❌ Exception occurred: {e}")
        print(traceback.format_exc())
        return {
            "response": f"Xin lỗi, đã xảy ra lỗi: {e}. Vui lòng thử lại sau.",
            "products": [],
            "actions": None,
            "timestamp": datetime.now().isoformat()
        }

    finally:
        db.close()
        print("[INFO] ✅ Database session closed.")

