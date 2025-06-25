import unicodedata

CATEGORY_SYNONYMS = {
    'điện thoại': ['điện thoại', 'phone', 'mobile', 'smartphone', 'cellphone', 'cell phone', 'mobiles'],
    'laptop': ['laptop', 'notebook', 'máy tính xách tay'],
    'máy tính bảng': ['máy tính bảng', 'tablet', 'ipad'],
}
INTENT_KEYWORDS = [
    'bán chạy', 'best seller', 'best_seller', 'giảm giá', 'giảm', 'flash sale', 'sale', 'mới nhất', 'newest', 'trending', 'hot', 'thịnh hành'
]
STOPWORDS = ['toi', 'tôi', 'muon', 'muốn', 'mua', 'các', 'sản', 'phẩm', 'thuộc', 'danh', 'mục', 'hàng', 'tìm', 'kiếm', 'giá', 'bao', 'nhiêu']

def remove_accents(input_str):
    nfkd_form = unicodedata.normalize('NFKD', input_str)
    return ''.join([c for c in nfkd_form if not unicodedata.combining(c)])
