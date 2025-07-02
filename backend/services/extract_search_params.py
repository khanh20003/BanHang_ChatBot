from services.constants import INTENT_KEYWORDS, STOPWORDS, remove_accents
import re
from typing import Optional, Dict, Any
import string
from rapidfuzz import process, fuzz
from services.gemini_service import get_model


def fuzzy_match(query: str, choices: list, threshold: int = 55) -> Optional[str]:
    query_norm = remove_accents(query.lower())
    choices_norm = [remove_accents(c.lower()) for c in choices]
    match, score, idx = process.extractOne(query_norm, choices_norm, scorer=fuzz.ratio)
    if match and score >= threshold:
        return choices[idx]
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
    stopwords_noaccent = [remove_accents(w) for w in STOPWORDS]
    all_keywords = set(stopwords_noaccent + intent_keywords_noaccent)

    # Danh sách brand chuẩn (không chứa alias)
    popular_brands = [
        'iphone', 'samsung', 'oppo', 'xiaomi', 'vivo', 'realme', 'asus', 'nokia',
        'huawei', 'lenovo', 'macbook', 'ipad', 'airpods', 'sony', 'anker', 'baseus', 'apple'
    ]
    # Alias mapping cho fuzzy fallback
    brand_alias_map = {
        # iPhone
        'iphon': 'iphone', 'iphonne': 'iphone', 'iphoone': 'iphone', 'iphonee': 'iphone', 'ipone': 'iphone', 'iphn': 'iphone',
        'iphoen': 'iphone', 'iphoen': 'iphone', 'iphn': 'iphone', 'iphnne': 'iphone', 'iphnone': 'iphone',
        # Samsung
        'samssung': 'samsung', 'sam sung': 'samsung', 'ssamsung': 'samsung', 'samsng': 'samsung', 'samsumg': 'samsung',
        'samung': 'samsung', 'samsugn': 'samsung', 'samsong': 'samsung',
        # Oppo
        'opppo': 'oppo', 'opo': 'oppo', 'oppoo': 'oppo', 'oppoe': 'oppo',
        # Xiaomi
        'xiomi': 'xiaomi', 'xiaom': 'xiaomi', 'xiaomii': 'xiaomi', 'xiaome': 'xiaomi', 'xiaoml': 'xiaomi',
        'xiaomio': 'xiaomi', 'xiaomoi': 'xiaomi',
        # Realme
        'realmi': 'realme', 'realmee': 'realme', 'reallme': 'realme',
        # Vivo
        'vivoo': 'vivo', 'vivoo': 'vivo', 'vivoe': 'vivo',
        # Asus
        'asuss': 'asus', 'asusz': 'asus', 'azus': 'asus', 'asusss': 'asus',
        # Nokia
        'nokiaa': 'nokia', 'nokiia': 'nokia', 'nokai': 'nokia',
        # Huawei
        'huaweii': 'huawei', 'huawai': 'huawei', 'huawey': 'huawei',
        # Lenovo
        'lenovoo': 'lenovo', 'lenov': 'lenovo', 'lenovvo': 'lenovo',
        # Macbook
        'macbok': 'macbook', 'macboook': 'macbook', 'macbbook': 'macbook',
        # iPad
        'ipadd': 'ipad', 'ipdad': 'ipad', 'ipaddd': 'ipad',
        # Airpods
        'airpod': 'airpods', 'airpords': 'airpods', 'airpds': 'airpods',
        # Apple
        'aple': 'apple', 'applle': 'apple', 'appple': 'apple',
        # Sony
        'sonny': 'sony', 'soni': 'sony',
        # Anker
        'anker': 'anker', 'ankerr': 'anker', 'ankre': 'anker',
        # Baseus
        'baseuss': 'baseus', 'baseu': 'baseus',
        # Thêm alias khác nếu cần ở đây
    }
    popular_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']
    # Danh sách màu phổ biến
    popular_colors = [
        'đen', 'trắng', 'xanh', 'đỏ', 'vàng', 'hồng', 'tím', 'xám', 'bạc', 'xanh lá', 'xanh dương',
        'cam', 'nâu', 'be', 'xanh navy', 'xanh rêu', 'xanh lam', 'xanh ngọc', 'xanh mint', 'xanh lục', 'xanh nước biển'
    ]
    color_alias_map = {
        'xanh lá': 'xanh lá', 'xanh lục': 'xanh lá', 'green': 'xanh lá',
        'xanh dương': 'xanh dương', 'xanh lam': 'xanh dương', 'blue': 'xanh dương',
        'xanh navy': 'xanh navy', 'navy': 'xanh navy',
        'xanh rêu': 'xanh rêu', 'rêu': 'xanh rêu',
        'xanh ngọc': 'xanh ngọc', 'ngọc': 'xanh ngọc',
        'xanh mint': 'xanh mint', 'mint': 'xanh mint',
        'xanh nước biển': 'xanh nước biển',
        # ... có thể bổ sung thêm ...
    }

    # --- AI entity extraction ---
    ai_entities = {}
    try:
        model = get_model()
        if model:
            prompt = f"""
Bạn là AI trích xuất entity cho chatbot bán hàng. Hãy trả về JSON với các trường: brand, category, model (nếu có), color (nếu có) từ câu sau. Nếu không có thì trả về null.
Câu: '{text}'
Chỉ trả lời đúng 1 dòng JSON, ví dụ: {{"brand": "iphone", "category": "điện thoại", "model": null, "color": "xanh"}}
"""
            response = model.generate_content(prompt)
            import json as _json
            ai_entities = _json.loads(response.text.strip().split('\n')[0])
    except Exception as e:
        print(f"[DEBUG] Gemini entity extract error: {e}")

    # Gán brand/category/model/color nếu có từ AI
    if ai_entities.get('brand'):
        params['brand'] = ai_entities['brand']
    if ai_entities.get('category'):
        params['category'] = ai_entities['category']
    if ai_entities.get('model'):
        params['model'] = ai_entities['model']
    if ai_entities.get('color'):
        params['color'] = ai_entities['color']

    # Làm sạch text khỏi brand/category/color đã biết
    if 'brand' in params:
        text_lower_noaccent = text_lower_noaccent.replace(remove_accents(params['brand'].lower()), "")
    if 'category' in params:
        text_lower_noaccent = text_lower_noaccent.replace(remove_accents(params['category'].lower()), "")
    if 'color' in params:
        text_lower_noaccent = text_lower_noaccent.replace(remove_accents(params['color'].lower()), "")

    # --- Product type ---
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

    # --- Clean name ---
    text_clean = text_lower_noaccent.translate(str.maketrans('', '', string.punctuation))
    product_words = [w for w in text_clean.split() if w and w not in all_keywords]
    if product_words:
        params['name'] = ' '.join(product_words).strip()

    # --- Fuzzy fallback nếu không có brand nhưng name có thể là brand ---
    if 'brand' not in params and 'name' in params:
        name_words = params['name'].split()
        guessed_brand = None
        for w in name_words:
            fuzzy_result = fuzzy_match(w, list(brand_alias_map.keys()) + popular_brands, threshold=55)
            if fuzzy_result:
                guessed_brand = brand_alias_map.get(fuzzy_result, fuzzy_result)
                break
        if not guessed_brand:
            fuzzy_result = fuzzy_match(params['name'], list(brand_alias_map.keys()) + popular_brands, threshold=55)
            if fuzzy_result:
                guessed_brand = brand_alias_map.get(fuzzy_result, fuzzy_result)
        if guessed_brand:
            params['brand'] = guessed_brand
            # Nếu name chỉ là brand hoặc chỉ còn brand (kể cả alias), loại bỏ name
            name_wo_brand = [w for w in name_words if remove_accents(w) != remove_accents(guessed_brand)]
            # Nếu name chỉ có 1 từ và từ đó là alias/brand thì loại luôn name
            if len(name_words) == 1 and (remove_accents(name_words[0]) == remove_accents(guessed_brand) or name_words[0] in brand_alias_map.keys()):
                params.pop('name', None)
            elif not name_wo_brand:
                params.pop('name', None)
            else:
                params['name'] = ' '.join(name_wo_brand)

    # --- Fuzzy fallback category nếu AI không ra ---
    if 'category' not in params:
        guessed_cat = fuzzy_match(text, popular_categories, threshold=65)
        if guessed_cat:
            params['category'] = guessed_cat

    # --- Fuzzy fallback color nếu AI không ra ---
    if 'color' not in params:
        guessed_color = fuzzy_match(text, list(color_alias_map.keys()) + popular_colors, threshold=70)
        if guessed_color:
            params['color'] = color_alias_map.get(guessed_color, guessed_color)

    # --- Price ---
    min_price, max_price = extract_price_range(text)
    if min_price is not None:
        params['min_price'] = min_price
    if max_price is not None:
        params['max_price'] = max_price

    # --- In stock ---
    in_stock_keywords = [
        "còn hàng", "có hàng", "in stock", "còn mua được", "còn không", "còn bán không", "còn không vậy", "còn không shop"
    ]
    if any(kw in text_lower for kw in in_stock_keywords):
        params["in_stock"] = True

    # Loại name nếu không có giá trị
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
