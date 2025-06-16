def tool_get_detail(name, user_id, question):
    print(f"Mock tool_get_detail called for product: {name}, user: {user_id}, question: {question}")
    # function_response, data
    mock_response = f"Đây là chi tiết giả lập cho sản phẩm {name}."
    mock_data = {
        "id": "SP001", 
        "name": name, 
        "description": "Mô tả chi tiết sản phẩm.", 
        "price": 5000000, 
        "link": f"https://www.example.com/product/{name.lower().replace(' ', '-')}"
    }
    return mock_response, mock_data

def get_detail_dmx(link):
    print(f"Mock get_detail_dmx called for link: {link}")
    return f"https://www.example.com/buy_now_link_for_{link.split('/')[-1]}" 