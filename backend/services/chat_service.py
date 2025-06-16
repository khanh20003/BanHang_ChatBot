from typing import Dict, Any
from datetime import datetime
import json
from google.protobuf.json_format import MessageToDict

from database.database import SessionLocal
from services.function_calling_service import process_message_with_function_calling, search_products
from services.gemini_service import call_gemini_function_calling

# ✅ Định nghĩa schema function để Gemini nhận biết
function_schema = [
    {
        "name": "search_products",
        "description": "Tìm kiếm sản phẩm theo các tiêu chí người dùng nhập",
        "parameters": {
            "type": "OBJECT",
            "properties": {
                "name": {"type": "STRING"},
                "min_price": {"type": "NUMBER"},
                "max_price": {"type": "NUMBER"},
                "status": {
                    "type": "STRING",
                    "enum": ["newest", "trending", "best_seller"]
                },
                "category": {"type": "STRING"},
                "rating": {"type": "NUMBER"},
                "is_flash_sale": {"type": "BOOLEAN"}
            },
            "required": []
        }
    }
]


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


def process_user_message(message: str, user_id: int) -> Dict[str, Any]:
    """
    Xử lý tin nhắn người dùng:
    - Nếu Gemini trả về function_call, lấy params trực tiếp từ function_call và truyền vào search_products.
    - Nếu không có function_call, trả về chat thường.
    - Đảm bảo trả về kết quả tự nhiên, không filter sai params.
    """
    db = SessionLocal()
    try:
        gemini_response = call_gemini_function_calling(function_schema, message)
        print(f"[DEBUG] ✅ Gemini raw response: {repr(gemini_response)}")

        if hasattr(gemini_response, 'candidates'):
            for idx, candidate in enumerate(gemini_response.candidates):
                print(f"[DEBUG] ➜ Candidate {idx}: {candidate}")
                content = getattr(candidate, 'content', None)
                if content and hasattr(content, 'parts'):
                    for part_idx, part in enumerate(content.parts):
                        print(f"[DEBUG] ➜ Part {part_idx}: {part}")
                        # Nếu part là function_call (dict hoặc object)
                        fc = None
                        if isinstance(part, dict) and 'function_call' in part:
                            fc = part['function_call']
                        elif not isinstance(part, dict) and hasattr(part, 'function_call') and part.function_call:
                            fc = part.function_call
                        if fc:
                            print(f"[INFO] ✅ Found function_call: {fc}")
                            params = extract_gemini_args(fc)
                            print(f"[DEBUG] ✅ Params dict: {params}")
                            if not params:
                                print(f"[WARN] ⚠️ Params empty for function_call: {fc}")
                            products = search_products(db, params, limit=10)
                            product_list = []
                            for p in products:
                                product_dict = {
                                    "id": p.id,
                                    "title": p.title,
                                    "image": p.image,
                                    "price": float(p.price),
                                    "currentPrice": float(getattr(p, 'currentPrice', p.price)) if getattr(p, 'currentPrice', None) else None,
                                    "status": p.status,
                                    "stock": getattr(p, 'stock', None),
                                    "category": {
                                        "id": p.category.id,
                                        "title": p.category.title,
                                        "image": getattr(p.category, 'image', None),
                                        "products": len(p.category.products) if getattr(p.category, 'products', None) is not None else 0
                                    } if getattr(p, 'category', None) else None,
                                    "short_description": getattr(p, 'short_description', None),
                                    "product_type": getattr(p, 'product_type', None),
                                    "actions": [
                                        {
                                            "type": "add_to_cart",
                                            "label": "Đặt hàng",
                                            "product_id": p.id
                                        }
                                    ]
                                }
                                product_list.append(product_dict)
                            return {
                                "response": f"Tìm thấy {len(product_list)} sản phẩm phù hợp.",
                                "products": product_list,
                                "actions": None,
                                "timestamp": datetime.now().isoformat()
                            }
                        # Nếu part là text (dict hoặc object)
                        text = part.get('text') if isinstance(part, dict) else (getattr(part, 'text', None) if not isinstance(part, dict) else None)
                        if text:
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
        # Fallback: không có function_call, trả về chat thường
        print(f"[WARN] ⚠️ No valid function_call or text found. Fallback triggered.")
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
