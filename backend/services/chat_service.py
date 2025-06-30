from typing import Dict, Any
from datetime import datetime
import json
from google.protobuf.json_format import MessageToDict
from database.database import SessionLocal
from services.function_calling_service import search_products, extract_search_params, is_discount_product
from services.gemini_service import call_gemini_function_calling, detect_product_intent, generate_gemini_response
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

def extract_gemini_args(fc):
    if isinstance(fc.args, dict) and fc.args:
        return fc.args
    try:
        d = dict(fc.args)
        if d:
            return d
    except Exception:
        pass
    try:
        d = MessageToDict(fc.args)
        if d:
            return d
    except Exception:
        pass
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

def is_discount_query(message: str) -> bool:
    keywords = ["giảm giá", "flash sale", "sale", "khuyến mãi", "ưu đãi"]
    return any(kw in message.lower() for kw in keywords)

def process_user_message(message: str, user_id: int) -> Dict[str, Any]:
    db = SessionLocal()
    try:
        # 🧠 Kiểm tra ý định
        is_product_query = detect_product_intent(message)
        if not is_product_query:
            response_text = generate_gemini_response(message)
            return {
                "response": response_text,
                "products": [],
                "actions": None,
                "timestamp": datetime.now().isoformat()
            }

        # ✅ Tiếp tục nếu là truy vấn về sản phẩm
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
                        params = None
                        if fc:
                            try:
                                params = extract_gemini_args(fc)
                            except Exception as e:
                                print(f"[CHAT ERROR] extract_gemini_args: {e}")
                        if not params:
                            try:
                                params = extract_search_params(message)
                            except Exception as e:
                                print(f"[CHAT ERROR] extract_search_params: {e}")
                        # Thêm log debug params sau khi extract
                        print("[DEBUG] search_params:", params)
                        if params:
                            try:
                                products = search_products(db, params, limit=10)
                            except Exception as e:
                                print(f"[CHAT ERROR] search_products: {e}")
                                products = []
                            is_discount = params.get('is_flash_sale') or is_discount_query(message)
                            if is_discount:
                                try:
                                    products = [p for p in products if is_discount_product(p)]
                                except Exception as e:
                                    print(f"[CHAT ERROR] is_discount_product: {e}")
                            elif params.get('product_type') in ['newest', 'best_seller', 'trending']:
                                pt = params['product_type']
                                try:
                                    products = [p for p in products if p.product_type == pt or (isinstance(pt, list) and p.product_type in pt)]
                                except Exception as e:
                                    print(f"[CHAT ERROR] product_type filter: {e}")
                            if products:
                                return {
                                    "response": f"Tìm thấy {len(products)} sản phẩm phù hợp.",
                                    "products": [product_to_dict(p) for p in products],
                                    "actions": None,
                                    "timestamp": datetime.now().isoformat()
                                }
                            else:
                                return {
                                    "response": "Xin lỗi, không tìm thấy sản phẩm phù hợp.",
                                    "products": [],
                                    "actions": None,
                                    "timestamp": datetime.now().isoformat()
                                }
                        text = part.get('text') if isinstance(part, dict) else getattr(part, 'text', None)
                        if text:
                            fallback_products = db.query(Product).filter(Product.stock > 0).order_by(Product.rating.desc(), Product.currentPrice.asc()).limit(10).all()
                            return {
                                "response": text + "\n\nShop gợi ý một số sản phẩm nổi bật cho anh/chị tham khảo:",
                                "products": [product_to_dict(p) for p in fallback_products],
                                "actions": None,
                                "timestamp": datetime.now().isoformat()
                            }
        params = extract_search_params(message)
        if params:
            products = search_products(db, params, limit=10)
            is_discount = params.get('is_flash_sale') or is_discount_query(message)
            if is_discount:
                products = [p for p in products if is_discount_product(p)]
            elif params.get('product_type') in ['newest', 'best_seller', 'trending']:
                pt = params['product_type']
                products = [p for p in products if p.product_type == pt or (isinstance(pt, list) and p.product_type in pt)]
            if products:
                return {
                    "response": f"Tìm thấy {len(products)} sản phẩm phù hợp.",
                    "products": [product_to_dict(p) for p in products],
                    "actions": None,
                    "timestamp": datetime.now().isoformat()
                }
            fallback_types = ['best_seller', 'newest', 'trending']
            fallback_products = db.query(Product).filter(Product.product_type.in_(fallback_types), Product.stock > 0).limit(10).all()
            return {
                "response": "Shop gợi ý một số sản phẩm nổi bật cho anh/chị tham khảo:",
                "products": [product_to_dict(p) for p in fallback_products],
                "actions": None,
                "timestamp": datetime.now().isoformat()
            }
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
