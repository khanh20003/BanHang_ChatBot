// utils/chatSession.js
export function getOrCreateChatSessionId() {
  let sessionId = localStorage.getItem('chat_session_id');
  if (!sessionId) {
    if (window.crypto && window.crypto.randomUUID) {
      sessionId = window.crypto.randomUUID();
    } else {
      // Fallback cho trình duyệt cũ
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    }
    localStorage.setItem('chat_session_id', sessionId);
  }
  return sessionId;
}
