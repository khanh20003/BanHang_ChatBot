import requests

def test_get_all_products():
    resp = requests.get("http://127.0.0.1:8000/products")
    assert resp.status_code == 200
    data = resp.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert 'id' in data[0] and 'title' in data[0]

def test_get_products_by_category():
    resp = requests.get("http://127.0.0.1:8000/products?category_id=9")
    assert resp.status_code == 200
    data = resp.json()
    assert all(p['category_id'] == 9 for p in data)

def test_get_products_by_search():
    resp = requests.get("http://127.0.0.1:8000/products?search=iphone")
    assert resp.status_code == 200
    data = resp.json()
    assert any("iphone" in p['title'].lower() for p in data)

def test_get_product_detail():
    resp = requests.get("http://127.0.0.1:8000/products/277")
    assert resp.status_code == 200
    data = resp.json()
    assert data['id'] == 277
    assert 'title' in data
