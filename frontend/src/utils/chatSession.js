// utils/chatSession.js

// Lấy hoặc tạo chat_session_id cho từng customerId
export function getOrCreateChatSessionId(customerId) {
  const key = customerId ? `chat_session_id_${customerId}` : 'chat_session_id_guest';
  let sessionId = localStorage.getItem(key);
  if (!sessionId) {
    if (window.crypto && window.crypto.randomUUID) {
      sessionId = window.crypto.randomUUID();
    } else {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem(key, sessionId);
  }
  return sessionId;
}

// Xóa chat_session_id khi customerId thay đổi hoặc logout
export function clearChatSessionId(customerId) {
  const key = customerId ? `chat_session_id_${customerId}` : 'chat_session_id_guest';
  localStorage.removeItem(key);
}