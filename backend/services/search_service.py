from sqlalchemy.orm import Session
from sqlalchemy import or_
from models.content_models import Product
from typing import List, Optional, Dict, Any
import re

def search_products(
    db: Session,
    search_params: Dict[str, Any],
    limit: int = 10
) -> List[Product]:
    """
    Tìm kiếm sản phẩm với các tham số tìm kiếm
    search_params có thể chứa các key sau:
    - name: tên sản phẩm
    - description: mô tả sản phẩm
    - min_price: giá tối thiểu
    - max_price: giá tối đa
    - status: trạng thái sản phẩm
    - category: danh mục sản phẩm
    - rating: đánh giá tối thiểu
    - is_flash_sale: tìm sản phẩm đang giảm giá
    """
    # Xây dựng query cơ bản
    query = db.query(Product)
    
    # Thêm điều kiện tìm kiếm theo tên
    if search_params.get('name'):
        name = search_params['name'].strip().lower()
        query = query.filter(Product.name.ilike(f'%{name}%'))
    
    # Thêm điều kiện tìm kiếm theo mô tả
    if search_params.get('description'):
        description = search_params['description'].strip().lower()
        query = query.filter(Product.description.ilike(f'%{description}%'))
    
    # Thêm điều kiện giá
    if search_params.get('min_price') is not None:
        query = query.filter(Product.price >= search_params['min_price'])
    if search_params.get('max_price') is not None:
        query = query.filter(Product.price <= search_params['max_price'])
    
    # Thêm điều kiện trạng thái
    if search_params.get('status'):
        query = query.filter(Product.status == search_params['status'])
    
    # Thêm điều kiện danh mục
    if search_params.get('category'):
        query = query.filter(Product.category == search_params['category'])
    
    # Thêm điều kiện đánh giá
    if search_params.get('rating') is not None:
        query = query.filter(Product.rating >= search_params['rating'])
    
    # Thêm điều kiện sản phẩm giảm giá
    if search_params.get('is_flash_sale'):
        query = query.filter(Product.current_price < Product.price)
    
    # Giới hạn số lượng kết quả
    query = query.limit(limit)
    
    return query.all()

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