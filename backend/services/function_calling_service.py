from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from models.content_models import Product, Category
from typing import List, Optional, Dict, Any
import re

def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 10
) -> List[Product]:
    query = db.query(Product)
    query = query.filter(Product.status == 'active')

    has_filter = False
    filter_logs = []

    # Lọc theo tên sản phẩm (tìm kiếm gần đúng, không phân biệt hoa thường, bỏ khoảng trắng thừa)
    if search_params.get('name'):
        name = search_params['name'].strip().lower()
        query = query.filter(or_(Product.title.ilike(f'%{name}%'), Product.short_description.ilike(f'%{name}%')))
        has_filter = True
        filter_logs.append(f"name~='{name}'")

    # Lọc theo mô tả ngắn
    if search_params.get('description'):
        description = search_params['description'].strip().lower()
        query = query.filter(Product.short_description.ilike(f'%{description}%'))
        has_filter = True
        filter_logs.append(f"description~='{description}'")

    # Lọc theo giá
    if search_params.get('min_price') is not None:
        query = query.filter(Product.price >= search_params['min_price'])
        has_filter = True
        filter_logs.append(f"min_price>={search_params['min_price']}")
    if search_params.get('max_price') is not None:
        query = query.filter(Product.price <= search_params['max_price'])
        has_filter = True
        filter_logs.append(f"max_price<={search_params['max_price']}")

    # Lọc theo trạng thái sản phẩm (product_type/status): hỗ trợ list hoặc string
    if search_params.get('status'):
        status = search_params['status']
        if isinstance(status, list):
            query = query.filter(Product.product_type.in_(status))
            filter_logs.append(f"status in {status}")
        else:
            query = query.filter(Product.product_type == status)
            filter_logs.append(f"status='{status}'")
        has_filter = True

    # Lọc theo tag (ví dụ: 'new', 'sale')
    if search_params.get('tag'):
        tag = search_params['tag'].strip().lower()
        query = query.filter(Product.tag.ilike(f"%{tag}%"))
        has_filter = True
        filter_logs.append(f"tag~='{tag}'")

    # Lọc theo danh mục (theo tên category)
    if search_params.get('category'):
        category = search_params['category'].strip().lower()
        query = query.filter(Product.category.has(Category.title.ilike(f"%{category}%")))
        has_filter = True
        filter_logs.append(f"category~='{category}'")

    # Lọc theo rating
    if search_params.get('rating') is not None:
        query = query.filter(Product.rating >= search_params['rating'])
        has_filter = True
        filter_logs.append(f"rating>={search_params['rating']}")

    # Lọc sản phẩm giảm giá (flash sale)
    if search_params.get('is_flash_sale'):
        query = query.filter(Product.product_type == 'flash_sale')
        has_filter = True
        filter_logs.append("is_flash_sale=True (product_type='flash_sale')")

    # Lọc sản phẩm còn hàng (stock > 0)
    if search_params.get('in_stock'):
        query = query.filter(Product.stock > 0)
        has_filter = True
        filter_logs.append("in_stock=True")

    if not has_filter:
        print('[DEBUG] ⚠️ Không có filter, không trả về toàn bộ sản phẩm.')
        return []

    print(f"[DEBUG] 🔎 Filter áp dụng: {', '.join(filter_logs)}")
    query = query.limit(limit)
    products = query.all()
    print(f"[DEBUG] ✅ Sản phẩm trả về sau filter: {[{'id': p.id, 'title': p.title, 'price': p.price, 'currentPrice': p.currentPrice} for p in products]}")
    if not products:
        print('[DEBUG] ❌ Không tìm thấy sản phẩm phù hợp với params:', search_params)
    return products


def extract_search_params(text: str) -> Dict[str, Any]:
    import re

    params = {}

    # Tách giá
    min_price, max_price = extract_price_range(text)
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price

    # Tách trạng thái
    status = extract_status(text)
    if status:
        params['status'] = status

    # Danh sách category bạn muốn hỗ trợ
    possible_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']

    text_lower = text.lower()

    # Tìm category nào xuất hiện trong câu
    found_category = None
    for cat in possible_categories:
        if cat in text_lower:
            found_category = cat
            break

    if found_category:
        params['category'] = found_category
        # Xoá category ra khỏi text để tránh gán vào name
        text_lower = text_lower.replace(found_category, '')

    # Bóc tách các từ quan trọng làm name (loại bỏ từ rác)
    stopwords = ['các', 'sản', 'phẩm', 'thuộc', 'danh', 'mục', 'hàng', 'tìm', 'kiếm', 'giá', 'bao', 'nhiêu']
    words = text_lower.split()
    product_words = []
    for word in words:
        if word.strip() and word not in stopwords and not any(unit in word for unit in ['triệu', 'tr', 'm', 'nghìn', 'k', 'đồng', 'vnd', 'vnđ']):
            product_words.append(word)

    if product_words:
        params['name'] = ' '.join(product_words).strip()

    # Nếu name chỉ còn trống hoặc toàn khoảng trắng thì bỏ luôn
    if 'name' in params and not params['name']:
        params.pop('name')

    return params



def extract_price_range(text: str) -> tuple[Optional[float], Optional[float]]:
    text = text.lower()
    min_price = None
    max_price = None
    price_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:triệu|tr|m)',
        r'(\d+(?:\.\d+)?)\s*(?:nghìn|k)',
        r'(\d+(?:\.\d+)?)\s*(?:đồng|vnd|vnđ)'
    ]

    if 'từ' in text or 'trên' in text:
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            if matches:
                value = float(matches[0])
                if 'triệu' in text or 'tr' in text or 'm' in text:
                    min_price = value * 1_000_000
                elif 'nghìn' in text or 'k' in text:
                    min_price = value * 1_000
                else:
                    min_price = value
                break

    if 'đến' in text or 'dưới' in text or 'khoảng' in text:
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            if matches:
                value = float(matches[0])
                if 'triệu' in text or 'tr' in text or 'm' in text:
                    max_price = value * 1_000_000
                elif 'nghìn' in text or 'k' in text:
                    max_price = value * 1_000
                else:
                    max_price = value
                break
    return min_price, max_price


def extract_status(text: str) -> Optional[str]:
    text = text.lower()
    status_patterns = {
        r'(?:mới|mới nhất|newest)': 'newest',
        r'(?:hot|thịnh hành|trending)': 'trending',
        r'(?:bán chạy|bán chạy nhất|best_seller)': 'best_seller'
    }
    for pattern, status in status_patterns.items():
        if re.search(pattern, text):
            return status
    return None


def process_message_with_function_calling(message: str, db) -> Dict[str, Any]:
    params = extract_search_params(message)

    # Nếu KHÔNG có params gì cụ thể => gợi ý sản phẩm trending/newest
    if not params:
        print('[DEBUG] ❗️ Không có params cụ thể => fallback sản phẩm trending')
        query = db.query(Product).filter(Product.status.in_(["trending", "newest"])).limit(10)
        products = query.all()
    else:
        products = search_products(db, params, limit=10)

    product_list = []
    for p in products:
        product_dict = {
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
                {
                    "type": "add_to_cart",
                    "label": "Đặt hàng",
                    "product_id": p.id
                }
            ]
        }
        product_list.append(product_dict)

    return {
        "response": f"Tìm thấy {len(product_list)} sản phẩm phù hợp." if product_list else "Hiện chưa tìm thấy sản phẩm phù hợp.",
        "products": product_list,
        "actions": None
    }

