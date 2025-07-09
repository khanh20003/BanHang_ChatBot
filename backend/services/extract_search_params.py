import sys, os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


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


def extract_brand_model_fuzzy(s, brand_list):
    words = s.split()
    # Dạng dính liền: chữ+số (ip16, ss24, xiaomi13, ...)
    for word in words:
        m = re.match(r'([a-zA-Z]{2,10})(\d{1,3}[a-z]*)', word)
        if m:
            brand_part, model_part = m.group(1), m.group(2)
            brand_guess = fuzzy_match(brand_part, brand_list, threshold=70)
            if brand_guess:
                return brand_guess, model_part, word
        # Fuzzy toàn bộ từ với brand
        brand_guess = fuzzy_match(word, brand_list, threshold=80)
        if brand_guess:
            return brand_guess, None, word
    # Dạng tách rời: brand + model (model có thể nhiều từ, vd: 15 pro max, note 13 pro)
    for i in range(len(words)):
        brand_guess = fuzzy_match(words[i], brand_list, threshold=70)
        if brand_guess:
            # Lấy model là các từ sau brand (tối đa 3 từ, vd: 15 pro max)
            model_tokens = []
            for j in range(i+1, min(i+4, len(words))):
                if re.match(r'\d+[a-z]*|pro|max|plus|ultra|note|air|mini|se|lite', words[j], re.IGNORECASE):
                    model_tokens.append(words[j])
                else:
                    break
            if model_tokens:
                return brand_guess, ' '.join(model_tokens), f"{words[i]} {' '.join(model_tokens)}"
            # Nếu chỉ có brand
            return brand_guess, None, words[i]
    return None, None, None


def extract_config_entities(text: str, params: dict) -> dict:
    # RAM (bổ sung nhận diện cả dạng 'ram 8gb', '8gb ram', '8gb')
    ram_match = re.search(r'(\d{1,2})\s*gb(\s*ram)?|ram\s*(\d{1,2})\s*gb', text)
    if ram_match:
        ram_value = ram_match.group(1) or ram_match.group(3)
        if ram_value:
            params['ram'] = f"{ram_value}GB"
            text = re.sub(r'(\d{1,2})\s*gb(\s*ram)?|ram\s*(\d{1,2})\s*gb', '', text, flags=re.IGNORECASE).strip()
    # ROM/SSD
    rom_match = re.search(r'(\d{2,4})\s*gb\s*(ssd|rom|bộ nhớ)|bộ nhớ\s*(\d{2,4})\s*gb', text)
    if rom_match:
        rom_value = rom_match.group(1) or rom_match.group(3)
        if rom_value:
            params['rom'] = f"{rom_value}GB"
            text = re.sub(r'(\d{2,4})\s*gb\s*(ssd|rom|bộ nhớ)|bộ nhớ\s*(\d{2,4})\s*gb', '', text, flags=re.IGNORECASE).strip()
    # Chip/CPU
    chip_match = re.search(r'(snapdragon|mediatek|exynos|apple|intel|amd|core i\d|m\d|a\d+|i\d+ gen \d+|i\d+|ryzen \d+|pentium|celeron|core m|core duo|core 2 duo|atom|xeon|epyc|threadripper|core ultra|core ultra \d+)', text)
    if chip_match:
        params['chip'] = chip_match.group(0)
        text = re.sub(chip_match.group(0), '', text, flags=re.IGNORECASE).strip()
    # GPU
    gpu_match = re.search(r'(rtx|gtx|mx|radeon|iris xe|arc|quadro|vega|hd graphics|uhd graphics|mali|adreno|powervr|gpu)\s*[\w\d]*', text)
    if gpu_match:
        params['gpu'] = gpu_match.group(0)
        text = re.sub(gpu_match.group(0), '', text, flags=re.IGNORECASE).strip()
    # Màn hình/Display
    display_match = re.search(r'(oled|amoled|ips|lcd|super amoled|retina|full hd|2k|4k|3.5k|qhd|uhd|fhd|hd|pro motion|ltpo|120hz|144hz|165hz|240hz|inch|cảm ứng|touch)', text)
    if display_match:
        params['display'] = display_match.group(0)
        text = re.sub(display_match.group(0), '', text, flags=re.IGNORECASE).strip()
    # Camera
    camera_match = re.search(r'(\d{2,4})\s*mp|camera\s*(\d{2,4})\s*mp', text)
    if camera_match:
        camera_value = camera_match.group(1) or camera_match.group(2)
        if camera_value:
            params['camera'] = f"{camera_value}MP"
            text = re.sub(r'(\d{2,4})\s*mp|camera\s*(\d{2,4})\s*mp', '', text, flags=re.IGNORECASE).strip()
    # Pin
    pin_match = re.search(r'(\d{3,5})\s*mah|pin\s*(\d{3,5})\s*mah', text)
    if pin_match:
        pin_value = pin_match.group(1) or pin_match.group(2)
        if pin_value:
            params['pin'] = f"{pin_value}mAh"
            text = re.sub(r'(\d{3,5})\s*mah|pin\s*(\d{3,5})\s*mah', '', text, flags=re.IGNORECASE).strip()
    # Sạc nhanh
    charging_match = re.search(r'(\d{2,3})\s*w|sạc nhanh\s*(\d{2,3})\s*w', text)
    if charging_match:
        charging_value = charging_match.group(1) or charging_match.group(2)
        if charging_value:
            params['charging'] = f"{charging_value}W"
            text = re.sub(r'(\d{2,3})\s*w|sạc nhanh\s*(\d{2,3})\s*w', '', text, flags=re.IGNORECASE).strip()
    # Map các từ/cụm từ đặc biệt về pin
    pin_keywords = [
        (r"pin trâu|pin khủng|pin lâu|pin bền|pin tốt|pin khỏe|pin trau|pin lau|pin khoe|pin ben", 5000),
        (r"pin yếu|pin kém|pin thấp", 3000)
    ]
    for pattern, min_value in pin_keywords:
        if re.search(pattern, text, re.IGNORECASE):
            params['min_pin'] = min_value
            # Loại cụm từ khỏi text để tránh lặp lại
            text = re.sub(pattern, '', text, flags=re.IGNORECASE).strip()
    return text, params

def extract_search_params(text: str) -> Dict[str, Any]:
    params = {}
    if text.isupper():
        text = text.lower()
    text_lower = text.lower()
    text_lower_noaccent = remove_accents(text_lower)
    intent_keywords_noaccent = [remove_accents(kw) for kw in INTENT_KEYWORDS]
    stopwords_noaccent = [remove_accents(w) for w in STOPWORDS]
    all_keywords = set(stopwords_noaccent + intent_keywords_noaccent)

    popular_brands = [
        'iphone', 'samsung', 'oppo', 'xiaomi', 'vivo', 'realme', 'asus', 'nokia',
        'huawei', 'lenovo', 'macbook', 'ipad', 'airpods', 'sony', 'anker', 'baseus', 'apple'
    ]
    brand_alias_map = {
        'ip': 'iphone', 'iphon': 'iphone', 'iphonne': 'iphone', 'iphoone': 'iphone', 'iphonee': 'iphone', 'ipone': 'iphone', 'iphn': 'iphone',
        'iphoen': 'iphone', 'iphnne': 'iphone', 'iphnone': 'iphone',
        'ss': 'samsung', 'samssung': 'samsung', 'sam sung': 'samsung', 'ssamsung': 'samsung', 'samsng': 'samsung', 'samsumg': 'samsung',
        'samung': 'samsung', 'samsugn': 'samsung', 'samsong': 'samsung',
        'opppo': 'oppo', 'opo': 'oppo', 'oppoo': 'oppo', 'oppoe': 'oppo',
        'xiomi': 'xiaomi', 'xiaom': 'xiaomi', 'xiaomii': 'xiaomi', 'xiaome': 'xiaomi', 'xiaoml': 'xiaomi',
        'xiaomio': 'xiaomi', 'xiaomoi': 'xiaomi',
        'realmi': 'realme', 'realmee': 'realme', 'reallme': 'realme',
        'vivoo': 'vivo', 'vivoe': 'vivo',
        'asuss': 'asus', 'asusz': 'asus', 'azus': 'asus', 'asusss': 'asus',
        'nokiaa': 'nokia', 'nokiia': 'nokia', 'nokai': 'nokia',
        'huaweii': 'huawei', 'huawai': 'huawei', 'huawey': 'huawei',
        'lenovoo': 'lenovo', 'lenov': 'lenovo', 'lenovvo': 'lenovo',
        'macbok': 'macbook', 'macboook': 'macbook', 'macbbook': 'macbook',
        'ipadd': 'ipad', 'ipdad': 'ipad', 'ipaddd': 'ipad',
        'airpod': 'airpods', 'airpords': 'airpods', 'airpds': 'airpods',
        'aple': 'apple', 'applle': 'apple', 'appple': 'apple',
        'sonny': 'sony', 'soni': 'sony',
        'anker': 'anker', 'ankerr': 'anker', 'ankre': 'anker',
        'baseuss': 'baseus', 'baseu': 'baseus',
    }
    popular_categories = ['laptop', 'điện thoại', 'máy tính bảng', 'tai nghe', 'phụ kiện']
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
    }

    # --- TÁCH ENTITY CẤU HÌNH & CATEGORY NGAY ĐẦU TIÊN ---
    text_after_config, config_params = extract_config_entities(text, {})
    params.update(config_params)

    # --- Fuzzy fallback category trên cả text gốc và text đã loại cấu hình ---
    if 'category' not in params:
        guessed_cat = fuzzy_match(text, popular_categories, threshold=65)
        if not guessed_cat:
            guessed_cat = fuzzy_match(text_after_config, popular_categories, threshold=65)
        if guessed_cat:
            params['category'] = guessed_cat

    # --- Loại bỏ triệt để từ khóa chung (stopwords, intent, category) khỏi text trước khi tách brand/model ---
    text_cleaned = remove_accents(text_after_config.lower())
    for kw in list(all_keywords) + popular_categories:
        text_cleaned = re.sub(rf'\b{remove_accents(kw)}\b', '', text_cleaned, flags=re.IGNORECASE)
    text_cleaned = re.sub(r'\s+', ' ', text_cleaned).strip()

    # --- Ưu tiên tách alias+model trên text đã loại từ khóa chung ---
    brand_alias, model_alias, word_alias = extract_brand_model_fuzzy(text_cleaned, popular_brands)
    if brand_alias:
        params['brand'] = brand_alias
    if model_alias:
        params['model'] = model_alias
    if word_alias:
        text_cleaned = re.sub(rf'\b{re.escape(word_alias)}\b', '', text_cleaned, flags=re.IGNORECASE)
        text_cleaned = text_cleaned.replace(word_alias, '').strip()
        text_after_config = re.sub(rf'\b{re.escape(word_alias)}\b', '', text_after_config, flags=re.IGNORECASE)
        text_after_config = text_after_config.replace(word_alias, '').strip()

    # --- Clean name từ text còn lại sau khi đã loại entity cấu hình & category ---
    text_clean = text_cleaned.translate(str.maketrans('', '', string.punctuation))
    product_words = [w for w in text_clean.split() if w and w not in all_keywords]
    if product_words:
        params['name'] = ' '.join(product_words).strip()

    # Sau khi clean name, luôn chạy extract_brand_model_fuzzy trên name để loại bỏ word_alias khỏi name nếu có
    if 'name' in params:
        brand_alias2, model_alias2, word_alias2 = extract_brand_model_fuzzy(params['name'], popular_brands)
        if word_alias2 and word_alias2 in params['name']:
            params['name'] = re.sub(rf'\b{re.escape(word_alias2)}\b', '', params['name'], flags=re.IGNORECASE)
            params['name'] = params['name'].replace(word_alias2, '').strip()
            name_noaccent = remove_accents(params['name']).strip()
            if not name_noaccent or name_noaccent in all_keywords:
                params.pop('name')

    # Nếu đã có brand/model thì loại khỏi name các cụm brand/model còn sót lại (không dấu, dính liền, tách rời)
    if 'name' in params and 'brand' in params:
        name_noaccent = remove_accents(params['name']).lower()
        brand_noaccent = remove_accents(params['brand']).lower()
        name_noaccent = re.sub(rf'\b{brand_noaccent}\b', '', name_noaccent).strip()
        if 'model' in params:
            model_noaccent = remove_accents(str(params['model'])).lower()
            name_noaccent = re.sub(rf'{brand_noaccent}\d+[a-z]*', '', name_noaccent)
            name_noaccent = re.sub(rf'\b{brand_noaccent}\b', '', name_noaccent)
            name_noaccent = re.sub(rf'{model_noaccent}', '', name_noaccent)
            name_noaccent = re.sub(rf'\b{model_noaccent}\b', '', name_noaccent)
        name_noaccent = re.sub(r'\s+', ' ', name_noaccent).strip()
        if not name_noaccent or name_noaccent in all_keywords:
            params.pop('name')
        else:
            params['name'] = name_noaccent

    # --- Fuzzy fallback brand nếu chưa có ---
    if 'brand' not in params and 'name' in params:
        name_words = params['name'].split()
        guessed_brand = None
        for w in name_words:
            fuzzy_result = fuzzy_match(w, popular_brands, threshold=60)
            if fuzzy_result:
                guessed_brand = fuzzy_result
                break
        if not guessed_brand:
            fuzzy_result = fuzzy_match(params['name'], popular_brands, threshold=60)
            if fuzzy_result:
                guessed_brand = fuzzy_result
        if guessed_brand:
            params['brand'] = guessed_brand
            name_wo_brand = [w for w in name_words if remove_accents(w) != remove_accents(guessed_brand)]
            if len(name_words) == 1 and remove_accents(name_words[0]) == remove_accents(guessed_brand):
                params.pop('name', None)
            elif not name_wo_brand:
                params.pop('name', None)
            else:
                params['name'] = ' '.join(name_wo_brand)

    # --- Fuzzy fallback model nếu có brand và số đứng sau brand ---
    if 'brand' in params and 'model' not in params:
        model_pattern = rf"{params['brand']}\s*([a-z]*\d+[a-z]*)"
        model_match = re.search(model_pattern, text, re.IGNORECASE)
        if not model_match and 'name' in params:
            model_match = re.search(model_pattern, params['name'], re.IGNORECASE)
        if model_match:
            params['model'] = model_match.group(1)

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

    # Nếu name là category phổ biến thì chuyển sang category (ưu tiên trước khi loại name)
    if 'name' in params:
        name_val = params['name'].strip().lower()
        if name_val in popular_categories:
            params['category'] = name_val
            params.pop('name')

    # Nếu có category và có entity cấu hình (ram, rom, pin, ...), loại bỏ name nếu name chỉ là category hoặc cấu hình
    config_fields = ['ram', 'rom', 'pin', 'color', 'camera', 'chip', 'gpu', 'display', 'charging']
    if 'category' in params and any(f in params for f in config_fields):
        if 'name' in params and (params['name'].strip().lower() == params['category'] or params['name'].strip().lower() in [params.get(f, '').lower() for f in config_fields]):
            params.pop('name')

    return params


def extract_price_range(text: str) -> tuple[Optional[float], Optional[float]]:
    text = text.lower()
    min_price = None
    max_price = None
    # Gom tất cả số và đơn vị tiền trong câu
    price_pattern = r'(\d+(?:\.\d+)?)\s*(triệu|tr|m|nghìn|k|đồng|vnd|vnđ)'
    matches = list(re.finditer(price_pattern, text))
    prices = []
    for m in matches:
        value = float(m.group(1))
        unit = m.group(2)
        if unit in ['triệu', 'tr', 'm']:
            value = value * 1_000_000
        elif unit in ['nghìn', 'k']:
            value = value * 1_000
        # đồng/vnd/vnđ giữ nguyên
        prices.append((m.start(), value))
    # Xác định min/max theo ngữ cảnh
    if len(prices) >= 2:
        # Tìm vị trí các từ khóa
        tu_idx = text.find('từ')
        den_idx = text.find('đến')
        duoi_idx = text.find('dưới')
        tren_idx = text.find('trên')
        khoang_idx = text.find('khoảng')
        # Nếu có 'từ ... đến ...'
        if tu_idx != -1 and den_idx != -1 and tu_idx < den_idx:
            min_price = prices[0][1]
            max_price = prices[1][1]
        # Nếu có 'khoảng ... đến ...'
        elif khoang_idx != -1 and den_idx != -1 and khoang_idx < den_idx:
            min_price = prices[0][1]
            max_price = prices[1][1]
        # Nếu có 'từ ...' và không có 'đến'
        elif tu_idx != -1:
            min_price = prices[0][1]
        # Nếu có 'dưới ...'
        elif duoi_idx != -1:
            max_price = prices[0][1]
        # Nếu có 'trên ...'
        elif tren_idx != -1:
            min_price = prices[0][1]
        else:
            # Mặc định: 2 số đầu là min/max
            min_price = prices[0][1]
            max_price = prices[1][1]
    elif len(prices) == 1:
        # Chỉ có 1 giá trị, xác định theo từ khóa
        if any(kw in text for kw in ['dưới', 'đến', 'tối đa', 'max']) and not any(kw in text for kw in ['từ', 'trên', 'tối thiểu', 'min']):
            max_price = prices[0][1]
        elif any(kw in text for kw in ['từ', 'trên', 'tối thiểu', 'min']) and not any(kw in text for kw in ['dưới', 'đến', 'tối đa', 'max']):
            min_price = prices[0][1]
        else:
            # Không rõ, trả về cả hai giống nhau
            min_price = max_price = prices[0][1]
    return min_price, max_price

if __name__ == "__main__":
    # Test nhiều câu hỏi thực tế
    test_cases = [
        # Test cấu hình
        "điện thoại ram 8gb",
        "laptop ram 16gb",
        "điện thoại bộ nhớ 256gb",
        "laptop ssd 512gb",
        "điện thoại pin trâu",
        "điện thoại pin 5000mah",
        "điện thoại camera 64mp",
        "laptop chip intel core i7",
        "laptop màn hình oled",
        # Test màu sắc
        "điện thoại màu đỏ",
        "điện thoại màu xanh",
        "laptop màu bạc",
        "điện thoại màu tím",
        # Test kết hợp nhiều thuộc tính
        "điện thoại samsung ram 8gb màu xanh",
        "laptop asus ram 16gb màu bạc",
        "điện thoại oppo pin trâu màu xanh",
        "laptop lenovo ssd 1tb màu xám",
        # Test các câu hỏi thực tế dạng viết tắt, dính liền, đảo thứ tự, nhiều thuộc tính
        "ip16 pro max xanh",
        "ss24 ram 12gb",
        "oppoa79 xanh",
        "xiaomiredminote13pro ram 8gb",
        "laptopasusvivobook16oled bạc",
        "macbookairm2 2024",
        "điện thoạiip16",
        "điện thoại ss24",
        "điện thoạioppoa79",
        "điện thoạixiaomiredminote13pro",
        # Test các câu hỏi cũ
        "có điện thoại ip16 ram 8gb",
        "ip 16 ram 8gb",
        "điện thoại ss24 ram 12gb",
        "ss 24 ram 12gb",
        "oppo a79 ram 8gb",
        "có iphone 15 pro max màu xanh",
        "laptop asus vivobook 16 oled",
        "macbook air m2 2024",
        "điện thoại xiaomi redmi note 13 pro",
        "có điện thoại ip 15 pro max 256gb",
        "điện thoại ip16",
        "điện thoại ip 16",
        "điện thoại ss24",
        "điện thoại ss 24",
        "điện thoại oppo a79",
        "điện thoại xiaomi redmi note 13 pro",
        "laptop asus vivobook",
        "macbook air m2",
    ]
    for test_text in test_cases:
        params = extract_search_params(test_text)
        print(f"[TEST] Input: {test_text}")
        print(f"[TEST] Params: {params}\n")
