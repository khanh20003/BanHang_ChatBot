from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from models.content_models import Product, Category
from typing import List, Optional, Dict, Any
import re
from services.extract_search_params import extract_search_params  # Thêm import

def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 10
) -> List[Product]:
    """
    Tìm kiếm sản phẩm với các tham số tìm kiếm
    search_params có thể chứa các key sau:
    - name: tên sản phẩm hoặc từ khóa (ví dụ: samsung)
    - category: danh mục sản phẩm (ví dụ: điện thoại)
    - min_price: giá tối thiểu
    - max_price: giá tối đa
    - status: trạng thái sản phẩm
    - rating: đánh giá tối thiểu
    - is_flash_sale: tìm sản phẩm đang giảm giá
    """
    # --- Bổ sung entity còn thiếu từ name nếu cần ---
    # Nếu search_params có 'name' nhưng thiếu brand/model/ram/... thì extract lại
    need_extract = False
    for key in ['brand', 'model', 'ram', 'color', 'storage', 'category']:
        if key not in search_params and search_params.get('name'):
            need_extract = True
            break
    if need_extract:
        # Gọi lại extract_search_params trên search_params['name'] để lấy thêm entity
        extracted = extract_search_params(search_params['name'])
        for k, v in extracted.items():
            if k not in search_params:
                search_params[k] = v

    # Xây dựng query cơ bản
    query = db.query(Product)

    # Lọc theo danh mục (category)
    if search_params.get('category'):
        category = search_params['category'].strip().lower()
        query = query.join(Product.category).filter(Category.title.ilike(f"%{category}%"))

    # Lọc theo từ khóa tên sản phẩm (name)
    if search_params.get('name'):
        name = search_params['name'].strip().lower()
        query = query.filter(Product.title.ilike(f"%{name}%"))

    # Lọc theo mô tả
    if search_params.get('description'):
        description = search_params['description'].strip().lower()
        query = query.filter(Product.short_description.ilike(f"%{description}%"))

    # Lọc theo giá
    if search_params.get('min_price') is not None:
        query = query.filter(Product.price >= search_params['min_price'])
    if search_params.get('max_price') is not None:
        query = query.filter(Product.price <= search_params['max_price'])

    # Lọc theo trạng thái
    if search_params.get('status'):
        query = query.filter(Product.status == search_params['status'])

    # Lọc theo loại sản phẩm
    if search_params.get('product_type'):
        query = query.filter(Product.product_type == search_params['product_type'])

    # Lọc theo đánh giá
    if search_params.get('rating') is not None:
        query = query.filter(Product.rating >= search_params['rating'])

    # Lọc sản phẩm giảm giá
    if search_params.get('is_flash_sale'):
        query = query.filter(Product.currentPrice < Product.price)

    # --- Lọc theo brand/model nếu có ---
    def remove_accents(s):
        import unicodedata
        return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')

    if search_params.get('brand'):
        brand = remove_accents(search_params['brand']).lower()
        query = query.filter(
            or_(
                Product.title.ilike(f"%{search_params['brand']}%"),
                Product.title.ilike(f"%{brand}%")
            )
        )
    if search_params.get('model'):
        model = remove_accents(str(search_params['model'])).lower()
        # Tối ưu: match mọi sản phẩm có chứa brand + model (vd: 'iPhone 16' match cả 'iPhone 16 Pro Max')
        if search_params.get('brand'):
            brand = remove_accents(search_params['brand']).lower()
            query = query.filter(
                or_(
                    Product.title.ilike(f"%{search_params['brand']}%{search_params['model']}%"),
                    Product.title.ilike(f"%{brand}%{model}%"),
                    Product.title.ilike(f"%{search_params['model']}%"),
                    Product.title.ilike(f"%{model}%")
                )
            )
        else:
            query = query.filter(
                or_(
                    Product.title.ilike(f"%{search_params['model']}%"),
                    Product.title.ilike(f"%{model}%")
                )
            )

    # --- Lọc theo các entity cấu hình (ram, rom, pin, color, camera, chip, gpu, display, charging) ---
    config_fields = ['ram', 'rom', 'pin', 'color', 'camera', 'chip', 'gpu', 'display', 'charging']
    for field in config_fields:
        value = search_params.get(field)
        if value:
            value_norm = value.strip().lower()
            query = query.filter(Product.short_description.ilike(f"%{value_norm}%"))

    # --- Lọc theo min_pin nếu có (lọc sản phẩm có pin >= giá trị này) ---
    if search_params.get('min_pin'):
        min_pin = int(search_params['min_pin'])
        # Lọc các sản phẩm có short_description chứa pin >= min_pin (dạng 'Pin: 5000mAh')
        # Sử dụng regexp để extract số pin từ short_description
        from sqlalchemy import func
        query = query.filter(
            func.cast(
                func.regexp_replace(
                    func.substr(Product.short_description, func.instr(Product.short_description, 'Pin:'), 20),
                    r'[^0-9]', ''
                ),
                int
            ) >= min_pin
        )

    # --- Sắp xếp theo giá nếu có sort_by_price ---
    if search_params.get('sort_by_price') == 'asc':
        query = query.order_by(Product.currentPrice.asc())
    elif search_params.get('sort_by_price') == 'desc':
        query = query.order_by(Product.currentPrice.desc())

    # Giới hạn số lượng kết quả
    query = query.limit(limit)
    results = query.all()

    # --- Fallback: Nếu filter theo ram không ra sản phẩm, gợi ý ram gần nhất ---
    if not results and search_params.get('ram'):
        ram_val = search_params['ram'].upper().replace('GB', '').strip()
        try:
            ram_num = int(ram_val)
        except Exception:
            ram_num = None
        if ram_num:
            # Lấy tất cả các ram có trong DB cùng category, cùng brand (nếu có)
            ram_pattern = r'(\d{1,2})GB'
            base_query = db.query(Product)
            if search_params.get('category'):
                category = search_params['category'].strip().lower()
                base_query = base_query.join(Product.category).filter(Category.title.ilike(f"%{category}%"))
            if search_params.get('brand'):
                brand = search_params['brand']
                base_query = base_query.filter(Product.title.ilike(f"%{brand}%"))
            all_products = base_query.all()
            ram_list = []
            for p in all_products:
                m = re.search(ram_pattern, p.short_description.upper())
                if m:
                    try:
                        ram_list.append((abs(int(m.group(1)) - ram_num), int(m.group(1)), p))
                    except:
                        pass
            ram_list.sort()  # Sắp xếp theo độ chênh lệch nhỏ nhất
            # Lấy các sản phẩm có ram gần nhất (ưu tiên lớn hơn, nhỏ hơn)
            fallback_products = []
            used_ram = set()
            for diff, ram, prod in ram_list:
                if ram not in used_ram:
                    fallback_products.append(prod)
                    used_ram.add(ram)
                if len(fallback_products) >= limit:
                    break
            return fallback_products
    return results

def extract_search_params(text: str) -> Dict[str, Any]:
    """
    Trích xuất các tham số tìm kiếm từ văn bản
    """
    params = {}
    
    # Trích xuất khoảng giá
    min_price, max_price = extract_price_range(text)
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price
    
    # Trích xuất trạng thái
    status = extract_status(text)
    if status:
        params['status'] = status
    
    # Trích xuất tên sản phẩm
    words = text.lower().split()
    product_words = []
    for word in words:
        # Bỏ qua các từ khóa về giá và trạng thái
        if not any(keyword in word for keyword in ['triệu', 'tr', 'm', 'nghìn', 'k', 'đồng', 'vnd', 'vnđ']):
            product_words.append(word)
    
    if product_words:
        params['name'] = ' '.join(product_words)
    
    return params

def extract_price_range(text: str) -> tuple[Optional[float], Optional[float]]:
    """
    Trích xuất khoảng giá từ văn bản
    """
    text = text.lower()
    min_price = None
    max_price = None
    
    # Pattern cho giá tiền
    price_patterns = [
        r'(\d+(?:\.\d+)?)\s*(?:triệu|tr|m)',
        r'(\d+(?:\.\d+)?)\s*(?:nghìn|k)',
        r'(\d+(?:\.\d+)?)\s*(?:đồng|vnd|vnđ)'
    ]
    
    # Tìm giá tối thiểu
    if 'từ' in text or 'trên' in text:
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            if matches:
                value = float(matches[0])
                if 'triệu' in text or 'tr' in text or 'm' in text:
                    min_price = value * 1000000
                elif 'nghìn' in text or 'k' in text:
                    min_price = value * 1000
                else:
                    min_price = value
                break
    
    # Tìm giá tối đa
    if 'đến' in text or 'dưới' in text or 'khoảng' in text:
        for pattern in price_patterns:
            matches = re.findall(pattern, text)
            if matches:
                value = float(matches[0])
                if 'triệu' in text or 'tr' in text or 'm' in text:
                    max_price = value * 1000000
                elif 'nghìn' in text or 'k' in text:
                    max_price = value * 1000
                else:
                    max_price = value
                break
    
    return min_price, max_price

def extract_status(text: str) -> Optional[str]:
    """
    Trích xuất trạng thái sản phẩm từ văn bản
    """
    text = text.lower()
    
    # Sử dụng regex để tìm các từ khóa liên quan đến trạng thái
    status_patterns = {
        r'(?:mới|mới nhất|newest)': 'newest',
        r'(?:hot|thịnh hành|trending)': 'trending',
        r'(?:bán chạy|bán chạy nhất|best_seller)': 'best_seller'
    }
    
    for pattern, status in status_patterns.items():
        if re.search(pattern, text):
            return status
    
    return None