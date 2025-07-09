from services.constants import CATEGORY_SYNONYMS, INTENT_KEYWORDS, STOPWORDS, remove_accents, DISCOUNT_KEYWORDS
from typing import List, Optional, Dict, Any, overload, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from models.content_models import Product, Category, Brand
from rapidfuzz import process, fuzz
from services.extract_search_params import extract_search_params
from services.gemini_service import detect_product_intent


def is_discount_product(product):
    """
    Chỉ coi là giảm giá nếu product_type == 'flash_sale', tag chứa từ khóa giảm giá, hoặc giá hiện tại thấp hơn giá gốc.
    """
    if getattr(product, 'product_type', None) == 'flash_sale':
        return True
    tag = getattr(product, 'tag', '') or ''
    if any(kw in tag.lower() for kw in DISCOUNT_KEYWORDS):
        return True
    # Bổ sung: Nếu currentPrice < price thì cũng coi là giảm giá
    try:
        if product.currentPrice is not None and product.price is not None and float(product.currentPrice) < float(product.price):
            return True
    except Exception as e:
        print(f"[DEBUG] is_discount_product: Lỗi so sánh giá: {e}")
    return False


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
        "color": getattr(p, "color", None),  # Thêm trường color vào dict trả về
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
    limit: int = 5  # Giới hạn trả về 5 sản phẩm mặc định
) -> List[Product]: ...


def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 5  # Giới hạn trả về 5 sản phẩm mặc định
) -> Tuple[List[Product], int]:
    """
    Tìm kiếm sản phẩm theo các tham số đã phân tích.
    Ưu tiên lọc sản phẩm giảm giá (flash_sale) nếu user hỏi về giảm giá.
    Tối ưu: Ưu tiên filter category trước, sau đó mới filter thuộc tính cấu hình.
    """
    # Lấy message gốc từ search_params['raw_message'] nếu có, nếu không thì lấy từ search_params['name'] hoặc ''
    raw_message = search_params.get('raw_message') or search_params.get('name') or ''
    # --- Dùng Gemini AI xác định intent người dùng ---
    try:
        if not detect_product_intent(raw_message):
            print(f"[AI-INTENT] Không phải ý định mua hàng: {raw_message}")
            return ([], 0)
    except Exception as e:
        print(f"[ERROR] detect_product_intent: {e}")
        return ([], 0)

    # PATCH: Ưu tiên tách brand và category từ name nếu chưa có, so sánh không dấu
    def normalize(text):
        return remove_accents(text.lower())
    # --- LOG: In params trước khi tách entity ---
    print(f"[DEBUG] search_params trước khi tách entity: {search_params}")
    # --- LOG: In params sau khi tách entity ---
    print(f"[DEBUG] search_params sau khi tách entity: {search_params}")

    # PATCH: Map status đặc biệt sang filter phù hợp
    if search_params.get('status') in ['trending', 'best_seller', 'newest'] and not search_params.get('product_type'):
        search_params['product_type'] = search_params['status']
    if search_params.get('status') in ['high_rating', 'đánh giá cao'] and not search_params.get('rating'):
        search_params['rating'] = 4.5
    if search_params.get('status') in ['cheap', 'giá rẻ'] and not search_params.get('sort_by'):
        search_params['sort_by'] = 'price_asc'
    if search_params.get('status') in ['expensive', 'cao cấp', 'giá cao', 'giá mắc'] and not search_params.get('sort_by'):
        search_params['sort_by'] = 'price_desc'

    # --- Lấy brand_id ưu tiên từ params['brand'] nếu có ---
    BRAND_ALIASES = {
        'iphone': 'Apple',
        'ip': 'Apple',
        'apple': 'Apple',
        'samsung': 'Samsung',
        'ss': 'Samsung',
        'galaxy': 'Samsung',
        'xiaomi': 'Xiaomi',
        'mi': 'Xiaomi',
        'redmi': 'Xiaomi',
        'poco': 'Xiaomi',
        'realme': 'Realme',
        'oppo': 'Oppo',
        'vivo': 'Vivo',
        'asus': 'Asus',
        'zenfone': 'Asus',
        'nokia': 'Nokia',
        'huawei': 'Huawei',
        'lenovo': 'Lenovo',
        'macbook': 'Apple',
        'ipad': 'Apple',
        'airpods': 'Apple',
        'sony': 'Sony',
        'anker': 'Anker',
        'baseus': 'Baseus',
        # ... có thể bổ sung thêm alias khác nếu cần ...
    }
    def get_brand_id(name: str) -> Optional[int]:
        if not name:
            return None
        # Map alias nếu có
        name_norm = remove_accents(name).lower()
        alias = BRAND_ALIASES.get(name_norm, name)
        brand_objs = db.query(Brand).all()
        brand_titles_noaccent = [remove_accents(b.title).lower() for b in brand_objs]
        result = process.extractOne(remove_accents(alias).lower(), brand_titles_noaccent, scorer=fuzz.ratio)
        if result:
            match, score, idx = result
            print(f"[DEBUG] get_brand_id('{name}') alias='{alias}' match='{match}' score={score} idx={idx}")
            return brand_objs[idx].id if match and score >= 80 else None
        else:
            return None

    def get_category_id(title: str) -> Optional[int]:
        if not title:
            return None
        title_norm = remove_accents(title.strip().lower())
        categories = db.query(Category).all()
        for cat in categories:
            if remove_accents(cat.title.lower()) == title_norm:
                return cat.id

        cat_titles_noaccent = [remove_accents(cat.title.lower()) for cat in categories]
        match, score, idx = process.extractOne(title_norm, cat_titles_noaccent, scorer=fuzz.ratio)
        # LOG: debug category match
        print(f"[DEBUG] get_category_id('{title}') match='{match}' score={score} idx={idx}")
        return categories[idx].id if match and score >= 80 else None

    brand_id = get_brand_id(search_params.get('brand')) if search_params.get('brand') else None
    category_id = get_category_id(search_params.get('category','')) if search_params.get('category') else None

    # LOG: In brand_id, category_id
    print(f"[DEBUG] brand_id={brand_id}, category_id={category_id}")

    # --- PATCH: Ưu tiên lọc category phù hợp với brand alias nếu chỉ có brand ---
    # Mapping brand alias -> category ưu tiên
    BRAND_CATEGORY_PRIORITIES = {
        'iphone': 'điện thoại',
        'macbook': 'laptop',
        'ipad': 'máy tính bảng',
        'airpods': 'tai nghe',
        # Có thể bổ sung thêm nếu cần
    }
    # Nếu chỉ có brand, không có category, thử map category theo brand alias
    if brand_id and not category_id and search_params.get('brand'):
        brand_key = remove_accents(search_params['brand'].strip().lower())
        if brand_key in BRAND_CATEGORY_PRIORITIES:
            cat_title = BRAND_CATEGORY_PRIORITIES[brand_key]
            cat_id = get_category_id(cat_title)
            if cat_id:
                category_id = cat_id
                print(f"[SMART] Gán category_id={category_id} ('{cat_title}') cho brand '{search_params['brand']}'")

    # Fallback extract nếu params rỗng
    if not search_params or not any(search_params.get(k) for k in ['name','category','product_type','status','tag','min_price','max_price','rating','is_flash_sale','in_stock']):
        raw_message = search_params.get('raw_message') if search_params else None
        if raw_message:
            search_params = extract_search_params(raw_message)
        if not search_params or not any(search_params.get(k) for k in ['name','category','product_type','status','tag','min_price','max_price','rating','is_flash_sale','in_stock']):
            return ([], 0)

    is_discount = search_params.get('is_flash_sale') or any(kw in (search_params.get('name','')+search_params.get('tag','')).lower() for kw in ['giảm giá','sale','flash sale','khuyến mãi','ưu đãi'])

    query = db.query(Product)
    filter_logs = []
    has_filter = False
    fuzzy_name = None

    # --- Ưu tiên filter category trước nếu có ---
    category_id = None
    if search_params.get('category'):
        # Lấy lại get_category_id nếu cần
        def get_category_id(title: str) -> Optional[int]:
            if not title:
                return None
            title_norm = remove_accents(title.strip().lower())
            categories = db.query(Category).all()
            for cat in categories:
                if remove_accents(cat.title.lower()) == title_norm:
                    return cat.id
            cat_titles_noaccent = [remove_accents(cat.title.lower()) for cat in categories]
            match, score, idx = process.extractOne(title_norm, cat_titles_noaccent, scorer=fuzz.ratio)
            return categories[idx].id if match and score >= 80 else None
        category_id = get_category_id(search_params['category'])
        if category_id:
            query = query.filter(Product.category_id == category_id)
            filter_logs.append(f"category_id={category_id}")
            has_filter = True

    # --- Filter brand nếu có ---
    brand_id = None
    if search_params.get('brand'):
        def get_brand_id(name: str) -> Optional[int]:
            if not name:
                return None
            name_norm = remove_accents(name).lower()
            alias = BRAND_ALIASES.get(name_norm, name)
            brand_objs = db.query(Brand).all()
            brand_titles_noaccent = [remove_accents(b.title).lower() for b in brand_objs]
            result = process.extractOne(remove_accents(alias).lower(), brand_titles_noaccent, scorer=fuzz.ratio)
            if result:
                match, score, idx = result
                return brand_objs[idx].id if match and score >= 80 else None
            else:
                return None
        brand_id = get_brand_id(search_params['brand'])
        if brand_id:
            query = query.filter(Product.brand_id == brand_id)
            filter_logs.append(f"brand_id={brand_id}")
            has_filter = True

    # --- Filter các thuộc tính cấu hình (RAM, chip, ...) trong phạm vi category đã chọn ---
    keywords = []
    if search_params.get('name'):
        keywords.append(search_params['name'])
    for key in ['ram', 'chip', 'cpu', 'gpu', 'màn', 'display', 'rom', 'storage', 'camera', 'color']:
        if search_params.get(key):
            keywords.append(str(search_params[key]))
    if keywords:
        or_clauses = []
        for kw in keywords:
            like_pattern = f"%{kw}%"
            or_clauses.append(Product.title.ilike(like_pattern))
            or_clauses.append(Product.short_description.ilike(like_pattern))
            or_clauses.append(Product.tag.ilike(like_pattern))
        query = query.filter(or_(*or_clauses))
        filter_logs.append(f"multi-field~={keywords}")
        has_filter = True
        fuzzy_name = ' '.join(keywords)

    # --- Lọc giảm giá ---
    if search_params.get('product_type') == 'flash_sale':
        query = query.filter(Product.product_type == 'flash_sale')
        filter_logs.append("product_type='flash_sale' (strict, no tag keyword)")
        has_filter = True
    elif is_discount:
        tag_expr = or_(*[Product.tag.ilike(f"%{kw}%") for kw in DISCOUNT_KEYWORDS])
        query = query.filter(
            or_(
                Product.product_type == 'flash_sale',
                tag_expr
            )
        )
        filter_logs.append("discount: product_type='flash_sale' OR tag contains discount keywords")
        has_filter = True

    # --- Filter brand & category logic ---
    if brand_id and category_id:
        query = query.filter(Product.brand_id == brand_id, Product.category_id == category_id)
        filter_logs.append(f"brand_id={brand_id} AND category_id={category_id}")
        has_filter = True
    elif brand_id:
        query = query.filter(Product.brand_id == brand_id)
        filter_logs.append(f"brand_id={brand_id}")
        has_filter = True
    elif category_id:
        query = query.filter(Product.category_id == category_id)
        filter_logs.append(f"category_id={category_id}")
        has_filter = True
    # --- Filter color nếu có ---
    if search_params.get('color'):
        color = search_params['color'].strip().lower()
        query = query.filter(func.lower(Product.color) == color)
        filter_logs.append(f"color='{color}'")
        has_filter = True
    # --- END PATCH ---

    # --- PATCH: Chỉ lọc theo title nếu message có nhiều từ hoặc có context rõ ràng ---
    if search_params.get('name') and not brand_id:
        name = search_params['name'].strip().lower()
        name_noaccent = remove_accents(name)
        query = query.filter(or_(func.lower(Product.title).ilike(f'%{name}%'), func.lower(Product.title).ilike(f'%{name_noaccent}%')))
        filter_logs.append(f"title~='{name}' (noaccent: '{name_noaccent}')")
        has_filter = True
        fuzzy_name = name
    if search_params.get('description'):
        description = search_params['description'].strip().lower()
        query = query.filter(Product.short_description.ilike(f'%{description}%'))
        filter_logs.append(f"description~='{description}'")
        has_filter = True
    if search_params.get('min_price') is not None:
        query = query.filter(Product.price >= search_params['min_price'])
        filter_logs.append(f"min_price>={search_params['min_price']}")
        has_filter = True
    if search_params.get('max_price') is not None:
        query = query.filter(Product.price <= search_params['max_price'])
        filter_logs.append(f"max_price<={search_params['max_price']}")
        has_filter = True
    if search_params.get('product_type') and not is_discount:
        pt = search_params['product_type']
        if isinstance(pt, list):
            query = query.filter(Product.product_type.in_(pt))
            filter_logs.append(f"product_type in {pt}")
        else:
            query = query.filter(Product.product_type == pt)
            filter_logs.append(f"product_type='{pt}'")
        has_filter = True
    if search_params.get('tag'):
        tag = search_params['tag'].strip().lower()
        query = query.filter(Product.tag.ilike(f"%{tag}%"))
        filter_logs.append(f"tag~='{tag}'")
        has_filter = True
    if search_params.get('rating') is not None:
        query = query.filter(Product.rating >= search_params['rating'])
        filter_logs.append(f"rating>={search_params['rating']}")
        has_filter = True
    # --- ALWAYS FILTER STOCK > 0 ---
    query = query.filter(Product.stock > 0)
    filter_logs.append("stock>0 (always)")
    has_filter = True
    if search_params.get('in_stock'):
        # Đã filter ở trên, chỉ log
        filter_logs.append("in_stock=True (redundant)")
    sort_by = search_params.get('sort_by')
    if sort_by == 'price_desc':
        query = query.order_by(Product.price.desc())
        filter_logs.append('sort_by=price_desc')
    elif sort_by == 'price_asc':
        query = query.order_by(Product.price.asc())
        filter_logs.append('sort_by=price_asc')
    # --- Đảm bảo mọi nhánh return đều trả về tuple ---
    try:
        if not has_filter:
            print(f"[DEBUG] Không có filter nào, trả về ([], 0)")
            return ([], 0)
        query = query.limit(limit * 2)
        products = query.all()
        # LOG: In filter_logs và số lượng sản phẩm
        print(f"[DEBUG] filter_logs: {filter_logs}")
        print(f"[DEBUG] Số sản phẩm lấy ra: {len(products)}")
        # Deduplicate by product title
        seen_titles = set()
        deduped_products = []
        for p in products:
            if p.title not in seen_titles:
                deduped_products.append(p)
                seen_titles.add(p.title)
        products = deduped_products[:limit]

        # LỌC LẠI THEO INTENT ĐẶC BIỆT (giảm giá, newest, best_seller, trending)
        if is_discount and search_params.get('product_type') != 'flash_sale':
            products = [p for p in products if is_discount_product(p)]
        elif search_params.get('product_type') in ['newest', 'best_seller', 'trending']:
            pt = search_params['product_type']
            if isinstance(pt, list):
                products = [p for p in products if p.product_type in pt]
            else:
                products = [p for p in products if p.product_type == pt]

        # Fallback fuzzy search nếu không ra sản phẩm
        if fuzzy_name and not products:
            all_products = db.query(Product).filter(Product.status == 'active', Product.stock > 0).all()
            main_keywords = [kw for kw in fuzzy_name.split() if remove_accents(kw) not in [remove_accents(k) for k in INTENT_KEYWORDS]]
            brand_id = None
            for kw in main_keywords:
                bid = get_brand_id(kw)
                if bid:
                    brand_id = bid
                    break
            filtered_products = all_products
            if brand_id and (search_params.get('category') or search_params.get('product_type') or search_params.get('status')):
                filtered_products = [p for p in all_products if getattr(p, 'brand_id', None) == brand_id]
            # --- Fuzzy filter theo color nếu có ---
            if search_params.get('color'):
                color = search_params['color'].strip().lower()
                filtered_products = [p for p in filtered_products if getattr(p, 'color', None) and p.color.strip().lower() == color]
            else:
                for kw in main_keywords:
                    kw_noaccent = remove_accents(kw)
                    filtered_products = [p for p in filtered_products if kw.lower() in p.title.lower() or kw_noaccent in remove_accents(p.title.lower()) or (p.short_description and (kw.lower() in p.short_description.lower() or kw_noaccent in remove_accents(p.short_description.lower())))]
            choices = [(f"{p.title} {p.short_description or ''}", p) for p in filtered_products]
            sorted_choices = sorted(choices, key=lambda x: fuzz.ratio(fuzzy_name, x[0]), reverse=True)
            products = [c[1] for c in sorted_choices[:limit]]
            # LỌC LẠI THEO INTENT ĐẶC BIỆT SAU KHI FUZZY
            if is_discount and search_params.get('product_type') != 'flash_sale':
                products = [p for p in products if is_discount_product(p)]
            elif search_params.get('product_type') in ['newest', 'best_seller', 'trending']:
                pt = search_params['product_type']
                if isinstance(pt, list):
                    products = [p for p in products if p.product_type in pt]
                else:
                    products = [p for p in products if p.product_type == pt]
            # LOG: fallback fuzzy search
            print(f"[DEBUG] Fallback fuzzy search, số sản phẩm: {len(products)}")
        # LOG: In chi tiết sản phẩm iPhone nếu có
        if brand_id:
            iphone_products = [p for p in products if p.brand_id == brand_id]
            print(f"[DEBUG] Sản phẩm brand_id={brand_id} (ví dụ iPhone): {[(p.id, p.title, p.stock) for p in iphone_products]}")
        # LOG: In danh sách sản phẩm theo brand_id sau khi xác định brand_id
        if brand_id:
            brand_products = db.query(Product).filter(Product.brand_id == brand_id).all()
            print(f"[DEBUG] Danh sách sản phẩm theo brand_id={brand_id}: {[(p.id, p.title, p.stock, p.status) for p in brand_products]}")
        # --- KHÔNG còn bất kỳ fallback/filter nào theo brand/category/nổi bật ở cuối hàm ---
        # --- AUTO: Chỉ trả về sản phẩm nếu có entity mua hàng rõ ràng ---
        try:
            if not any(search_params.get(k) for k in ['name', 'category', 'min_price', 'max_price', 'status', 'rating', 'product_type', 'is_flash_sale']):
                return ([], 0)
            return (products, len(products))
        except Exception as e:
            import traceback
            print("[ERROR] Exception in search_products:", e)
            traceback.print_exc()
            return ([], 0)
    except Exception as e:
        import traceback
        print("[ERROR] Exception in search_products:", e)
        traceback.print_exc()
        return ([], 0)

