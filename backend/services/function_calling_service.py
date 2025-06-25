from services.constants import CATEGORY_SYNONYMS, INTENT_KEYWORDS, STOPWORDS, remove_accents
from typing import List, Optional, Dict, Any, overload
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models.content_models import Product, Category
from rapidfuzz import process, fuzz
from services.extract_search_params import extract_search_params


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


@overload
def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 10
) -> List[Product]: ...


def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 10
) -> List[Product]:
    """
    Tìm kiếm sản phẩm theo các tham số đã phân tích.
    
    Args:
        db (Session): SQLAlchemy session.
        search_params (Dict[str, Any]): Các tham số lọc, ví dụ:
            - name: từ khóa tên
            - category: danh mục
            - min_price, max_price: khoảng giá
            - status, rating, in_stock, is_flash_sale
        limit (int): Số lượng sản phẩm tối đa trả về.

    Returns:
        List[Product]: Danh sách sản phẩm ORM object.
    """

    # Nếu có cả product_type và name, và name chỉ là từ ý định, loại bỏ name khỏi filter
    if search_params.get('product_type') and search_params.get('name'):
        name_noaccent = remove_accents(search_params['name']).strip()
        intent_keywords_noaccent = [remove_accents(kw) for kw in INTENT_KEYWORDS]
        if name_noaccent in intent_keywords_noaccent:
            del search_params['name']
    query = db.query(Product)
    has_filter = False
    filter_logs = []
    fuzzy_name = None
    fuzzy_mode = False

    # Lọc theo tên sản phẩm (tìm kiếm gần đúng, không phân biệt hoa thường, bỏ khoảng trắng thừa, không dấu cho từ khóa)
    if search_params.get('name'):
        name = search_params['name'].strip().lower()
        name_noaccent = remove_accents(name)
        # Nếu name chỉ là 1 từ (ví dụ: 'iphone', 'oppo', 'macbook'), chỉ lọc theo title
        if len(name.split()) == 1:
            query = query.filter(
                or_(func.lower(Product.title).ilike(f'%{name}%'), func.lower(Product.title).ilike(f'%{name_noaccent}%'))
            )
            filter_logs.append(f"title~='{name}' (noaccent: '{name_noaccent}') (strict)")
        else:
            # Nếu name có nhiều từ, vẫn ưu tiên lọc theo title, nhưng cho phép fuzzy ở bước sau nếu không có kết quả
            query = query.filter(
                or_(func.lower(Product.title).ilike(f'%{name}%'), func.lower(Product.title).ilike(f'%{name_noaccent}%'))
            )
            filter_logs.append(f"title~='{name}' (noaccent: '{name_noaccent}')")
        has_filter = True
        fuzzy_name = name
        # Nếu không tìm thấy sản phẩm theo title, mới thử tiếp short_description ở bước fuzzy phía dưới
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

    # Lọc theo product_type (ưu tiên nếu có)
    if search_params.get('product_type'):
        pt = search_params['product_type']
        if isinstance(pt, list):
            query = query.filter(Product.product_type.in_(pt))
            filter_logs.append(f"product_type in {pt}")
        else:
            query = query.filter(Product.product_type == pt)
            filter_logs.append(f"product_type='{pt}'")
        has_filter = True

    # Lọc theo category (nếu có) bằng category_id, chỉ fallback synonyms nếu KHÔNG tìm thấy category_id
    if search_params.get('category'):
        category_title = search_params['category'].strip().lower()
        category_obj = db.query(Category).filter(func.lower(Category.title) == category_title).first()
        if category_obj:
            query = query.filter(Product.category_id == category_obj.id)
            filter_logs.append(f"category_id={category_obj.id} ({category_obj.title})")
            has_filter = True
        else:
            synonyms = CATEGORY_SYNONYMS.get(category_title, [category_title])
            category_filters = [Product.category.has(Category.title.ilike(f"%{syn}%")) for syn in synonyms]
            query = query.filter(or_(*category_filters))
            filter_logs.append(f"category~synonyms={synonyms}")
            has_filter = True

    # Lọc theo trạng thái sản phẩm (status) nếu không có product_type
    elif search_params.get('status'):
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

    # Lọc theo danh mục (theo tên category, hỗ trợ từ đồng nghĩa phổ biến)
    # ĐÃ ĐƯỢC XỬ LÝ Ở TRÊN, KHÔNG LỌC LẠI LẦN NỮA
    # if search_params.get('category'):
    #     category = search_params['category'].strip().lower()
    #     # Danh sách từ đồng nghĩa phổ biến cho một số category lớn
    #     category_synonyms = {
    #         'điện thoại': ['điện thoại', 'phone', 'mobile', 'smartphone', 'cellphone', 'cell phone', 'mobiles'],
    #         'laptop': ['laptop', 'notebook', 'máy tính xách tay'],
    #         'máy tính bảng': ['máy tính bảng', 'tablet', 'ipad'],
    #         # Có thể mở rộng thêm các nhóm khác nếu cần
    #     }
    #     synonyms = category_synonyms.get(category, [category])
    #     # Tạo filter OR cho tất cả từ đồng nghĩa
    #     category_filters = [Product.category.has(Category.title.ilike(f"%{syn}%")) for syn in synonyms]
    #     query = query.filter(or_(*category_filters))
    #     has_filter = True
    #     filter_logs.append(f"category~synonyms={synonyms}")

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

    # Sắp xếp theo giá cao/thấp nếu có sort_by
    sort_by = search_params.get('sort_by')
    if sort_by == 'price_desc':
        query = query.order_by(Product.price.desc())
        filter_logs.append('sort_by=price_desc')
    elif sort_by == 'price_asc':
        query = query.order_by(Product.price.asc())
        filter_logs.append('sort_by=price_asc')

    if not has_filter:
        print('[DEBUG] ⚠️ Không có filter, không trả về toàn bộ sản phẩm.')
        return []

    print(f"[DEBUG] 🔎 Filter áp dụng: {', '.join(filter_logs)}")
    query = query.limit(limit * 2)  # Lấy nhiều hơn để dedup sau
    products = query.all()

    # Deduplicate by product title (giữ sản phẩm đầu tiên với mỗi title)
    seen_titles = set()
    deduped_products = []
    for p in products:
        if p.title not in seen_titles:
            deduped_products.append(p)
            seen_titles.add(p.title)
    products = deduped_products[:limit]

    # Nếu tìm theo name mà không ra sản phẩm, thử fuzzy search với ngưỡng an toàn
    if fuzzy_name and not products:
        print('[DEBUG] 🟡 Không tìm thấy sản phẩm với ilike, thử fuzzy search...')
        # Nếu có category, chỉ fuzzy trong nhóm category đó
        fuzzy_products_query = db.query(Product).filter(Product.status == 'active')
        if search_params.get('category'):
            category_title = search_params['category'].strip().lower()
            category_obj = db.query(Category).filter(func.lower(Category.title) == category_title).first()
            if category_obj:
                fuzzy_products_query = fuzzy_products_query.filter(Product.category_id == category_obj.id)
        all_products = fuzzy_products_query.all()
        # Tách các từ khóa ý định ra khỏi fuzzy_name để chỉ lấy từ khóa thực sự
        main_keywords = [kw for kw in fuzzy_name.split() if remove_accents(kw) not in [remove_accents(k) for k in INTENT_KEYWORDS]]
        # Ưu tiên lọc brand: nếu main_keywords có từ khóa thương hiệu (ví dụ: 'samsung', 'oppo', 'xiaomi', ...), chỉ lấy sản phẩm có chứa từ đó trong title hoặc short_description
        BRANDS = ['samsung', 'oppo', 'xiaomi', 'iphone', 'apple', 'realme', 'vivo', 'asus', 'nokia', 'sony', 'huawei', 'itel', 'mobell', 'masstel', 'lenovo', 'motorola']
        brand_kw = None
        for kw in main_keywords:
            if any(b in remove_accents(kw).lower() for b in BRANDS):
                brand_kw = kw
                break
        filtered_products = all_products
        if brand_kw:
            brand_kw_noaccent = remove_accents(brand_kw).lower()
            filtered_products = [p for p in all_products if brand_kw.lower() in p.title.lower() or brand_kw_noaccent in remove_accents(p.title.lower()) or (p.short_description and (brand_kw.lower() in p.short_description.lower() or brand_kw_noaccent in remove_accents(p.short_description.lower())))]
        else:
            for kw in main_keywords:
                kw_noaccent = remove_accents(kw)
                filtered_products = [p for p in filtered_products if kw.lower() in p.title.lower() or kw_noaccent in remove_accents(p.title.lower()) or (p.short_description and (kw.lower() in p.short_description.lower() or kw_noaccent in remove_accents(p.short_description.lower())))]
        # Nếu lọc ra được sản phẩm liên quan, chỉ fuzzy trong nhóm này
        if filtered_products and main_keywords:
            choices = [(f"{p.title} {p.short_description or ''}", p) for p in filtered_products]
        else:
            choices = [(f"{p.title} {p.short_description or ''}", p) for p in all_products]
        # Sắp xếp theo độ tương đồng giảm dần với từ khóa chính
        sorted_choices = sorted(choices, key=lambda x: fuzz.ratio(fuzzy_name, x[0]), reverse=True)
        top_products = [c[1] for c in sorted_choices[:limit]]
        products = top_products

    return products

