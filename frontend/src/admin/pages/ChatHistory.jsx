import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Trash2, 
  User,
  Bot,
  Shield,
  Clock,
  Filter
} from 'lucide-react';
import { fetchUserList } from '../api/userApi';

const ChatMessage = ({ message }) => (
  <div className={`flex ${message.sender === 'admin' ? 'justify-end' : 'justify-start'} mb-4`}>
    <div className={`flex max-w-[70%] ${message.sender === 'admin' ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
        message.sender === 'admin' 
          ? 'bg-blue-100 text-blue-600 ml-2' 
          : message.sender === 'bot'
          ? 'bg-purple-100 text-purple-600 ml-2'
          : 'bg-gray-100 text-gray-600 mr-2'
      }`}>
        {message.sender === 'admin' ? (
          <Shield size={16} />
        ) : message.sender === 'bot' ? (
          <Bot size={16} />
        ) : (
          <User size={16} />
        )}
      </div>
      <div className={`rounded-lg px-4 py-2 ${
        message.sender === 'admin'
          ? 'bg-blue-600 text-white'
          : message.sender === 'bot'
          ? 'bg-purple-100 text-purple-900'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <p className="text-sm">{message.content}</p>
        <p className="text-xs mt-1 opacity-75">
          {new Date(message.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  </div>
);

const ChatHistory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedSender, setSelectedSender] = useState('all');
  const [chatHistory, setChatHistory] = useState([]);
  const [users, setUsers] = useState([
    { id: 'all', name: 'All Users' }
  ]);

  // Fetch user list (giả sử có API, nếu chưa có thì dùng cứng)
  useEffect(() => {
    async function getUsers() {
      try {
        const data = await fetchUserList();
        setUsers([{ id: 'all', name: 'All Users' }, ...data.map(u => ({ id: u.id, name: u.full_name || u.username }))]);
      } catch {
        setUsers([{ id: 'all', name: 'All Users' }]);
      }
    }
    getUsers();
  }, []);

  // Fetch chat history khi selectedUser thay đổi
  useEffect(() => {
    if (selectedUser === 'all') {
      setChatHistory([]); // Hoặc fetch toàn bộ nếu backend hỗ trợ
      return;
    }
    const fetchHistory = async () => {
      try {
        const res = await fetch(`http://127.0.0.1:8000/chat/history/${selectedUser}`);
        if (!res.ok) throw new Error('Lỗi khi lấy lịch sử chat');
        const data = await res.json();
        // Chuẩn hóa dữ liệu cho phù hợp với ChatMessage
        setChatHistory(data.map(msg => ({
          id: msg.id,
          user_id: selectedUser,
          user_name: users.find(u => u.id === selectedUser)?.name || '',
          content: msg.message,
          sender: msg.sender,
          timestamp: msg.timestamp
        })));
      } catch (e) {
        setChatHistory([]);
      }
    };
    fetchHistory();
  }, [selectedUser, users]);

  const senders = [
    { id: 'all', name: 'All Senders' },
    { id: 'user', name: 'Users' },
    { id: 'admin', name: 'Admins' },
    { id: 'bot', name: 'Bot' }
  ];

  const handleDelete = (messageId) => {
    // TODO: Implement delete functionality
    console.log('Delete message:', messageId);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Chat History</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage customer support conversations
        </p>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <select
            value={selectedSender}
            onChange={(e) => setSelectedSender(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
          >
            {senders.map((sender) => (
              <option key={sender.id} value={sender.id}>
                {sender.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="space-y-4">
          {chatHistory.map((message) => (
            <div key={message.id} className="group relative">
              <ChatMessage message={message} />
              <button
                onClick={() => handleDelete(message.id)}
                className="absolute top-2 right-2 p-1 text-gray-400 opacity-0 group-hover:opacity-100 hover:text-red-600 transition-opacity"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
        <div className="flex flex-1 justify-between sm:hidden">
          <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Previous
          </button>
          <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Next
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Showing <span className="font-medium">1</span> to{' '}
              <span className="font-medium">10</span> of{' '}
              <span className="font-medium">97</span> messages
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                Previous
              </button>
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                Next
              </button>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;