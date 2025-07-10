import React, { useState, useEffect, useRef } from 'react';
import { Search, Trash2, User, Bot, Shield, Filter } from 'lucide-react';

async function fetchUserList() {
  const res = await fetch('http://127.0.0.1:8000/admin/users', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
      'Content-Type': 'application/json'
    }
  });
  if (!res.ok) throw new Error('Lỗi khi lấy danh sách user');
  return await res.json();
}

const ChatMessage = ({ message }) => {
  // Bot bên phải, user và admin bên trái
  const isBot = message.sender === 'bot';
  return (
    <div className={`flex ${isBot ? 'justify-end' : 'justify-start'} mb-6`}>
      <div className={`flex max-w-[70%] ${isBot ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${
          isBot ? 'bg-purple-100 text-purple-600 ml-3' : message.sender === 'admin' ? 'bg-blue-100 text-blue-600 ml-3' : 'bg-gray-100 text-gray-600 mr-3'
        }`}>
          {isBot ? <Bot size={20} /> : message.sender === 'admin' ? <Shield size={20} /> : <User size={20} />}
        </div>
        <div className={`rounded-lg px-4 py-3 ${
          isBot ? 'bg-purple-100 text-purple-900' : message.sender === 'admin' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-900'
        } shadow-md hover:shadow-lg transition-shadow`}>
          {/* Nếu là khách vãng lai thì hiển thị guest_id */}
          {message.guest_id && (
            <div className="text-xs text-gray-500 mb-1">Guest ID: <span className="font-mono">{message.guest_id}</span></div>
          )}
          <p className="text-md">{message.content}</p>
          {Array.isArray(message.products) && message.products.length > 0 && (
            <div className="mt-3">
              <div className="font-semibold mb-1">Sản phẩm liên quan:</div>
              <ul className="list-disc ml-5">
                {message.products.map((p) => (
                  <li key={p.id}>
                    <a href={`http://localhost:3000/product/${p.id}`} target="_blank" rel="noopener noreferrer">
                      {(p.title || p.name)} - {p.currentPrice != null ? p.currentPrice : p.price} đ
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <p className="text-sm mt-1 opacity-75">{new Date(message.timestamp).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  // Mặc định chưa chọn user nào
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedSender, setSelectedSender] = useState('all');
  const [chatHistory, setChatHistory] = useState([]);
  // users không có "Tất cả user" nữa, chỉ có user thật và guest cụ thể
  const [users, setUsers] = useState([]);

  useEffect(() => {
    async function getUsers() {
      try {
        // Lấy đúng API mới trả về users và guests
        const res = await fetch('http://127.0.0.1:8000/user/list', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`,
            'Content-Type': 'application/json'
          }
        });
        if (!res.ok) throw new Error('Lỗi khi lấy danh sách user/guest');
        const data = await res.json();
        // data: { users: [...], guests: [...] }
        setUsers([...(data.users || []), ...(data.guests || [])]);
      } catch {
        setUsers([]);
      }
    }
    getUsers();
  }, []);

  // Tham chiếu DOM để cuộn xuống cuối
  const chatEndRef = useRef(null);
  // WebSocket ref
  const wsRef = useRef(null);

  useEffect(() => {
    // Chỉ fetch khi đã chọn user cụ thể
    if (!selectedUser) {
      setChatHistory([]);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }
    // Fetch lịch sử ban đầu
    const fetchHistory = async () => {
      try {
        let res = await fetch(`http://127.0.0.1:8000/chat/history/${selectedUser}`);
        if (!res.ok) {
          setChatHistory([]);
          return;
        }
        const data = await res.json();
        let rawMessages = Array.isArray(data) ? data : (data.messages || []);
        // Sắp xếp tin nhắn theo thời gian tăng dần (cũ -> mới)
        const sortedMessages = rawMessages
          .map(msg => {
            let content = msg.message;
            let products = undefined;
            if (typeof msg.message === 'object' && msg.message !== null) {
              content = msg.message.text || '';
              products = Array.isArray(msg.message.products) ? msg.message.products : undefined;
            }
            let user_id = msg.user_id || msg.customer_id || msg.guest_id || 'guest';
            let user_name = (users.find(u => u.id.toString() === user_id)?.name || user_id);
            return {
              id: msg.id,
              user_id,
              user_name,
              guest_id: msg.guest_id,
              content,
              products,
              sender: msg.sender,
              timestamp: msg.timestamp
            };
          })
          .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        setChatHistory(sortedMessages);
      } catch (e) {
        setChatHistory([]);
      }
    };
    fetchHistory();

    // Kết nối WebSocket
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    const ws = new window.WebSocket(`ws://127.0.0.1:8000/ws/chat/${selectedUser}`);
    wsRef.current = ws;
    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        setChatHistory(prev => {
          // Tránh trùng id (nếu có)
          if (prev.some(m => m.id === msg.id && msg.id !== undefined)) return prev;
          return [...prev, msg].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        });
      } catch {}
    };
    ws.onclose = () => {};
    return () => {
      ws.close();
    };
  }, [selectedUser, users]);

  // Tự động cuộn xuống cuối khi chatHistory thay đổi
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory]);

  const senders = [
    { id: 'all', name: 'All Senders' },
    { id: 'user', name: 'Users' },
    { id: 'admin', name: 'Admins' },
    { id: 'bot', name: 'Bot' }
  ];

  const handleDelete = (messageId) => console.log('Delete message:', messageId);

  const filteredHistory = chatHistory.filter(msg =>
    (selectedSender === 'all' || msg.sender === selectedSender) &&
    (msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // State cho input chat admin
  const [adminMessage, setAdminMessage] = useState("");
  const [sending, setSending] = useState(false);

  // Hàm gửi tin nhắn admin
  const handleSendAdminMessage = async () => {
    if (!selectedUser || !adminMessage.trim()) return;
    setSending(true);
    try {
      // Gửi qua WebSocket nếu có
      if (wsRef.current && wsRef.current.readyState === 1) {
        const msg = {
          id: Date.now(), // tạm thời, backend có thể cập nhật lại
          user_id: selectedUser,
          user_name: users.find(u => u.id.toString() === selectedUser)?.name || selectedUser,
          guest_id: undefined,
          content: adminMessage,
          products: undefined,
          sender: "admin",
          timestamp: new Date().toISOString()
        };
        wsRef.current.send(JSON.stringify(msg));
        setAdminMessage("");
      } else {
        // fallback: gửi API như cũ
        const res = await fetch("http://127.0.0.1:8000/chat/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            'Authorization': `Bearer ${localStorage.getItem('adminToken') || ''}`
          },
          body: JSON.stringify({
            message: adminMessage,
            customer_id: selectedUser,
            sender: "admin"
          })
        });
        if (res.ok) setAdminMessage("");
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 space-y-8 bg-gradient-to-br from-white to-gray-50">
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">Chat History</h1>
        <p className="mt-2 text-md text-gray-600">Xem lịch sử trò chuyện của người dùng và khách</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 hover:shadow-md transition-all"
          />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none hover:shadow-md transition-all">
            <option value="" disabled>Chọn user hoặc khách vãng lai...</option>
            <optgroup label="Người dùng">
              {users.filter(u => u.group === 'user').map((user) => (
                <option key={user.id} value={user.id.toString()}>{user.name}</option>
              ))}
            </optgroup>
            <optgroup label="Khách vãng lai">
              {users.filter(u => u.group === 'guest').map((user) => (
                <option key={user.id} value={user.id.toString()}>{user.name.replace('Guest: ', 'Khách: ')}</option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select value={selectedSender} onChange={(e) => setSelectedSender(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none hover:shadow-md transition-all">
            {senders.map((sender) => <option key={sender.id} value={sender.id}>{sender.name}</option>)}
          </select>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-6 max-h-[60vh] overflow-y-auto">
          {selectedUser === '' ? (
            <div className="text-center text-gray-400 py-8">Vui lòng chọn user hoặc khách vãng lai để xem lịch sử chat.</div>
          ) : filteredHistory.length > 0 ? (
            <>
              {filteredHistory.map((message) => (
                <div key={message.id} className="group relative">
                  <ChatMessage message={message} />
                </div>
              ))}
              <div ref={chatEndRef} />
            </>
          ) : (
            <div className="text-center text-gray-400 py-8">No messages found.</div>
          )}
        </div>
        {/* Form chat admin */}
        {selectedUser && (
          <form
            className="flex gap-2 mt-4"
            onSubmit={e => {
              e.preventDefault();
              handleSendAdminMessage();
            }}
          >
            <input
              type="text"
              value={adminMessage}
              onChange={e => setAdminMessage(e.target.value)}
              placeholder="Nhập tin nhắn gửi user..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              disabled={sending}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              disabled={sending || !adminMessage.trim()}
            >Gửi</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatHistory;