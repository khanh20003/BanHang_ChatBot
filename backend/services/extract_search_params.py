from services.constants import INTENT_KEYWORDS, STOPWORDS, remove_accents
import re
from typing import Optional, Dict, Any
import string
from rapidfuzz import process, fuzz


def fuzzy_match(query: str, choices: list, threshold: int = 65) -> Optional[str]:
    """
    Fuzzy match cho brand/category, trả về chuỗi khớp tốt nhất nếu score đủ lớn.
    Tăng độ nhạy sửa lỗi chính tả bằng cách giảm threshold và thử match từng từ trong câu.
    """
    query_norm = remove_accents(query.lower())
    choices_norm = [remove_accents(c.lower()) for c in choices]
    # Thử match toàn bộ câu
    match, score, idx = process.extractOne(query_norm, choices_norm, scorer=fuzz.ratio)
    if match and score >= threshold:
        return choices[idx]
    # Nếu không đủ score, thử match từng từ
    for word in query_norm.split():
        match, score, idx = process.extractOne(word, choices_norm, scorer=fuzz.ratio)
        if match and score >= threshold:
            return choices[idx]
    return None


def extract_search_params(text: str) -> Dict[str, Any]:
    params = {}
    if text.isupper():
        text = text.lower()
    text_lower = text.lower()
    text_lower_noaccent = remove_accents(text_lower)
    intent_keywords_noaccent = [remove_accents(kw) for kw in INTENT_KEYWORDS]

    # Các cụm tổng quát không nên filter theo name
    general_phrases = [
        "xem tat ca", "xem tất cả", "toan bo shop", "toàn bộ shop", "toan bo san pham", "toàn bộ sản phẩm",
        "tat ca san pham", "tất cả sản phẩm", "co gi trong shop", "có gì trong shop", "xem shop", "xem sản phẩm"
    ]
    if any(phrase in text_lower_noaccent for phrase in general_phrases):
        possible_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']
        possible_categories_noaccent = [remove_accents(cat) for cat in possible_categories]
        for cat, cat_noaccent in zip(possible_categories, possible_categories_noaccent):
            if cat in text_lower or cat_noaccent in text_lower_noaccent:
                params['category'] = cat
                break
        return params

    # Gắn cờ intent sản phẩm đặc biệt
    if re.search(r"flash\s?sale|flash_sale", text_lower):
        params["product_type"] = "flash_sale"
    elif re.search(r"giảm giá|sale|khuyến mãi|ưu đãi|đang giảm", text_lower):
        params["is_flash_sale"] = True
    elif re.search(r"bán chạy|best\s?seller|best_seller", text_lower):
        params["product_type"] = "best_seller"
    elif re.search(r"mới nhất|newest|mới", text_lower):
        params["product_type"] = "newest"
    elif re.search(r"trending|hot|thịnh hành", text_lower):
        params["product_type"] = "trending"

    # Danh sách brand phổ biến
    possible_brands = ['iphone', 'samsung', 'oppo', 'xiaomi', 'vivo', 'realme', 'asus', 'nokia', 'huawei', 'lenovo', 'macbook', 'ipad', 'airpods', 'sony', 'anker', 'baseus']
    found_brand = fuzzy_match(text, possible_brands)
    if found_brand:
        params['brand'] = found_brand
        # Loại brand đã nhận diện khỏi text để tránh ảnh hưởng đến name
        text_lower_noaccent = text_lower_noaccent.replace(remove_accents(found_brand.lower()), "")

    # Danh sách category phổ biến
    possible_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']
    found_category = fuzzy_match(text, possible_categories)
    if found_category:
        params['category'] = found_category
        text_lower_noaccent = text_lower_noaccent.replace(remove_accents(found_category.lower()), "")

    # Gán name nếu có từ còn lại sau khi loại bỏ intent, stopword, brand/category
    stopwords_noaccent = [remove_accents(w) for w in STOPWORDS]
    all_keywords = set(stopwords_noaccent + intent_keywords_noaccent)
    text_clean = text_lower_noaccent.translate(str.maketrans('', '', string.punctuation))
    product_words = [w for w in text_clean.split() if w and w not in all_keywords]
    if product_words:
        params['name'] = ' '.join(product_words).strip()

    # Giá
    min_price, max_price = extract_price_range(text)
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price

    # Ý định còn hàng
    in_stock_keywords = [
        "còn hàng", "có hàng", "in stock", "còn mua được", "còn không", "còn bán không", "còn không vậy", "còn không shop"
    ]
    if any(kw in text_lower for kw in in_stock_keywords):
        params["in_stock"] = True

    # Nếu name chỉ còn keyword vô nghĩa thì loại bỏ
    if 'name' in params:
        name_noaccent = remove_accents(params['name']).strip()
        if name_noaccent in all_keywords or not name_noaccent:
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