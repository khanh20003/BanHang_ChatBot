from services.constants import INTENT_KEYWORDS, STOPWORDS, remove_accents
import re
from typing import Optional, Dict, Any

def extract_search_params(text: str) -> Dict[str, Any]:
    params = {}
    if text.isupper():
        text = text.lower()
    text_lower = text.lower()
    text_lower_noaccent = remove_accents(text_lower)
    intent_keywords_noaccent = [remove_accents(kw) for kw in INTENT_KEYWORDS]
    # Nếu là các câu tổng quát xem tất cả sản phẩm/shop thì không filter name
    general_phrases = [
        "xem tat ca", "xem tất cả", "toan bo shop", "toàn bộ shop", "toan bo san pham", "toàn bộ sản phẩm",
        "tat ca san pham", "tất cả sản phẩm", "co gi trong shop", "có gì trong shop", "xem shop", "xem sản phẩm"
    ]
    if any(phrase in text_lower_noaccent for phrase in general_phrases):
        return params
    # Ánh xạ ý định mềm cho các trường hợp phổ biến
    if re.search(r"giảm giá|flash sale|sale|đang giảm", text_lower):
        params["product_type"] = "flash_sale"
    elif re.search(r"bán chạy|best\s?seller|best_seller", text_lower):
        params["product_type"] = "best_seller"
    elif re.search(r"mới nhất|newest|mới", text_lower):
        params["product_type"] = "newest"
    elif re.search(r"trending|hot|thịnh hành", text_lower):
        params["product_type"] = "trending"
    possible_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']
    possible_categories_noaccent = [remove_accents(cat) for cat in possible_categories]
    found_category = None
    found_category_span = None
    for cat, cat_noaccent in zip(possible_categories, possible_categories_noaccent):
        idx = text_lower.find(cat)
        idx_noaccent = text_lower_noaccent.find(cat_noaccent)
        if idx != -1:
            found_category = cat
            found_category_span = (idx, idx + len(cat))
            break
        elif idx_noaccent != -1:
            found_category = cat
            found_category_span = (idx_noaccent, idx_noaccent + len(cat_noaccent))
            break
    if found_category and found_category_span:
        name_candidate = text_lower.strip()
        name_wo_category = name_candidate.replace(found_category, '').strip()
        name_wo_category = name_wo_category.replace(found_category.replace(' ', ''), '').strip()
        name_words = [w for w in name_wo_category.split() if w]
        name_words_no_intent = [w for w in name_words if not any(kw in w for kw in INTENT_KEYWORDS)]
        if name_words_no_intent:
            params['name'] = ' '.join(name_words_no_intent)
        params['category'] = found_category
    else:
        stopwords_noaccent = [remove_accents(w) for w in STOPWORDS]
        product_words = [w for w in text_lower_noaccent.split() if w and w not in stopwords_noaccent]
        product_words_no_intent = [w for w in product_words if w not in intent_keywords_noaccent]
        if product_words_no_intent:
            params['name'] = ' '.join(product_words_no_intent).strip()
    if 'name' in params:
        name_noaccent = remove_accents(params['name']).strip()
        if name_noaccent in intent_keywords_noaccent or not name_noaccent:
            params.pop('name')
    # Giá
    min_price, max_price = extract_price_range(text)
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price
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
