def get_provinces_from_dienmayxanh():
    print("Mock get_provinces_from_dienmayxanh called")
    return [{"id": 1, "name": "Tỉnh Mock"}]

def get_district_from_dienmayxanh(province_id):
    print(f"Mock get_district_from_dienmayxanh called for province {province_id}")
    return [{"id": 101, "name": "Huyện Mock"}]

def get_ward_from_dienmayxanh(province_id, district_id):
    print(f"Mock get_ward_from_dienmayxanh called for province {province_id}, district {district_id}")
    return [{"id": 10101, "name": "Xã Mock"}]

def get_cart_from_dienmayxanh(user_id, province_id, district_id, ward_id, address, products):
    print(f"Mock get_cart_from_dienmayxanh for user {user_id} with {len(products)} products.")
    # Expected return: orders, accumulated_point, total, promotion, lastrow_fee_summary
    mock_orders = {"fee": 20000, "expected_delivery_date": "Ngày mai"}
    accumulated_point = 100
    total = sum(p.get('price',0) * p.get('quantity',1) for p in products) + mock_orders["fee"]
    promotion = "Khuyến mãi giảm 10%"
    lastrow_fee_summary = "Phí vận chuyển: 20,000 VND"
    return mock_orders, accumulated_point, total, promotion, lastrow_fee_summary

def add_product_to_cart_dmx(user_id, product_link_buy_now):
    print(f"Mock add_product_to_cart_dmx for user {user_id}, product: {product_link_buy_now}")
    return None

def order_dmx(user_id, customer_name, phone_number, province_id, district_id, ward_id, address):
    print(f"Mock order_dmx for user {user_id}, customer {customer_name} at {address}")
    return None 