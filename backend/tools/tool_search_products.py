def tool_search_products(keyword, user_id, type_product, keyword_other):
    print(f"Mock tool_search_products called with keyword: {keyword}, user_id: {user_id}, type: {type_product}, other_keywords: {keyword_other}")
    products = [
        {
            "id": "P123", 
            "name": f"Sản phẩm {type_product if type_product else 'chung'} 1 liên quan đến '{keyword}'", 
            "price": 1000000, 
            "link": "https://www.example.com/product/p123",
            "description": f"Mô tả cho sản phẩm 1 '{keyword}'"
        },
        {
            "id": "P456", 
            "name": f"Sản phẩm {type_product if type_product else 'chung'} 2 liên quan đến '{keyword}'", 
            "price": 1500000, 
            "link": "https://www.example.com/product/p456",
            "description": f"Mô tả cho sản phẩm 2 '{keyword}'"
        }
    ]
    if keyword_other:
        products.append({
            "id": "P789", 
            "name": f"Sản phẩm từ keyword khác: {keyword_other[0] if keyword_other else ''}", 
            "price": 1200000, 
            "link": "https://www.example.com/product/p789",
            "description": f"Mô tả cho sản phẩm từ keyword khác"
        })
    return products

def google_search(query):
    print(f"Mock google_search called with query: {query}")
    return f"Kết quả tìm kiếm Google giả lập cho: {query}. Tìm thấy sản phẩm A, sản phẩm B."

def tool_get_product_flash_sale():
    print("Mock tool_get_product_flash_sale called")
    return [
        {
            "id": "FS001", 
            "name": "Sản phẩm Flash Sale 1", 
            "price": 800000, 
            "original_price": 1200000,
            "link": "https://www.example.com/flashsale/fs001"
        }
    ] 