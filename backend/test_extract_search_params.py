import sys, os
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from services.extract_search_params import extract_search_params

test_cases = [
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
