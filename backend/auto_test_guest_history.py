import requests

API_URL = "http://127.0.0.1:8000"

# 1. Gửi tin nhắn với khách vãng lai (customer_id=0)
post_data = {
    "customer_id": 0,
    "message": "Xin chào, tôi muốn hỏi về iPhone 16"
}
resp = requests.post(f"{API_URL}/chat/", json=post_data)
resp.raise_for_status()
data = resp.json()
print("[STEP 1] Gửi tin nhắn:")
print(data)

chat_session_id = data.get("chat_session_id")
if not chat_session_id:
    raise Exception("Không nhận được chat_session_id từ backend!")

# 2. Lấy lịch sử chat của khách vãng lai
history_url = f"{API_URL}/chat/history/session/{chat_session_id}"
history_resp = requests.get(history_url)
history_resp.raise_for_status()
history = history_resp.json()
print("\n[STEP 2] Lịch sử chat của khách vãng lai:")
for msg in history:
    print(f"[{msg['timestamp']}] {msg['sender']}: {msg['message']}")
