import React, { useState, useEffect, useRef } from 'react';
import '../index.css'; // Import global styles if needed
import './Chatbot.css'; // Import Chatbot specific styles
// Import các component khác nếu cần, ví dụ cho danh sách sản phẩm
// import ProductListMessage from './ProductListMessage';

// Nhận customerId từ props nếu cần
const Chatbot = ({ customerId }) => {
    // State để quản lý trạng thái mở/đóng của cửa sổ chat
    const [isOpen, setIsOpen] = useState(false); // Bắt đầu với đóng
    // State để lưu trữ tin nhắn
    const [messages, setMessages] = useState([
        // Tin nhắn mẫu dựa trên ảnh
        { text: 'Chào mừng Anh Chị đến với Siêu Thị Điện máy - Nội thất Chợ Lớn! Em là trợ lý AI luôn sẵn lòng hỗ trợ anh chị ạ 😊', sender: 'bot' },
    ]);
    // State để lưu trữ nội dung input
    const [inputMessage, setInputMessage] = useState('');
    const [isSending, setIsSending] = useState(false);

    // Ref cho vùng tin nhắn để cuộn xuống dưới
    const chatBoxRef = useRef(null);
     // Ref cho cửa sổ chat và nút chat
    const chatWindowRef = useRef(null);
    const chatButtonRef = useRef(null);

    // Hàm để toggle cửa sổ chat
    const toggleChatWindow = () => {
        setIsOpen(!isOpen);
    };

    // Hàm gửi tin nhắn
    const sendMessage = async () => {
        if (isSending) return;
        if (inputMessage.trim() === '') return;
        setIsSending(true);
        const userMessage = inputMessage;
        // Thêm tin nhắn người dùng vào state ngay lập tức
        setMessages(prevMessages => [...prevMessages, { text: userMessage, sender: 'user' }]);
        setInputMessage('');

        // TODO: Gửi userMessage và customerId đến backend của bạn
        // console.log('Sending message to backend:', userMessage, 'for customer:', customerId);

        if (!customerId) {
            console.error("customerId is not provided. Cannot send message.");
            // Tùy chọn: hiển thị lỗi cho người dùng
            setMessages(prevMessages => [...prevMessages, { text: "Lỗi: Không có thông tin khách hàng để gửi tin nhắn.", sender: 'bot' }]);
            return;
        }

        const apiUrl = 'http://127.0.0.1:8000/chat/'; // Endpoint API của backend

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: userMessage,
                    customer_id: customerId // Sử dụng customerId từ props
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Lỗi khi gửi tin nhắn đến backend:', response.status, errorData);
                setMessages(prevMessages => [...prevMessages, { text: `Lỗi: ${errorData.detail || response.statusText}`, sender: 'bot' }]);
                return;
            }

            const responseData = await response.json();
            console.log('Phản hồi từ chatbot backend:', responseData);

            // Xử lý và thêm tin nhắn phản hồi từ bot vào state
            // Giả định backend trả về phản hồi dạng { response: "..." } hoặc { products: [...] }
            const botMessages = [];

            if (responseData && responseData.response) {
                 botMessages.push({ text: responseData.response, sender: 'bot', type: 'text' });
            }

            // Xử lý các loại phản hồi khác nếu có (ví dụ: danh sách sản phẩm)
            if (responseData && responseData.products && responseData.products.length > 0) {
                 // Bạn có thể cần một component riêng để hiển thị danh sách sản phẩm
                 botMessages.push({ type: 'product_list', data: responseData.products, sender: 'bot' });
            }

             // Cập nhật state messages với các tin nhắn từ bot
            if (botMessages.length > 0) {
                 setMessages(prevMessages => [...prevMessages, ...botMessages]);
            } else if (!responseData.response) { // Trường hợp không có cả response text và data đặc biệt
                 setMessages(prevMessages => [...prevMessages, { text: "Bot không trả lời.", sender: 'bot', type: 'text' }]);
            }

        } catch (error) {
            console.error('Lỗi kết nối đến backend:', error);
            setMessages(prevMessages => [...prevMessages, { text: "Lỗi kết nối đến server.", sender: 'bot', type: 'text' }]);
        } finally {
            setIsSending(false);
        }
    };

    // Effect để cuộn xuống cuối khi có tin nhắn mới
    useEffect(() => {
        if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
        }
    }, [messages]); // Cuộn khi state messages thay đổi

    // Effect để điều chỉnh hiển thị cửa sổ chat
    useEffect(() => {
        if (chatWindowRef.current) {
            chatWindowRef.current.style.display = isOpen ? 'flex' : 'none';
        }
    }, [isOpen]); // Chạy lại khi isOpen thay đổi

    // Hàm xử lý click vào nút hành động nhanh (ví dụ)
    const handleQuickAction = (action) => {
        console.log('Quick action clicked:', action);
        // TODO: Gửi action đến backend hoặc xử lý tương ứng
        // Ví dụ: sendMessage(action); // Gửi action như một tin nhắn của người dùng
    };


    return (
        <div className="chat-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {/* Nút Chat Icon */}
            <button 
                ref={chatButtonRef}
                className="chat-button" 
                onClick={toggleChatWindow} 
                title="Chat với chúng tôi"
                 style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#004AAD', color: 'white', border: 'none', cursor: 'pointer', display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                {/* Icon chat */} { /* Sử dụng icon chat mặc định */ }
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            {/* Chat Window */} {/* style display được quản lý bởi useEffect */} 
            <div 
                ref={chatWindowRef}
                className="chat-window" 
                style={{ width: '350px', height: '500px', border: '1px solid #ccc', display: 'none', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' }}
            >
                {/* Header */}
                <div className="chat-header" style={{ backgroundColor: '#004AAD', color: 'white', padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="chat-header-logo" style={{ marginRight: '10px' }}>
                        {/* Thay bằng logo thật của bạn */}
                        <div style={{width: '30px', height: '30px', backgroundColor: 'yellow', borderRadius: '50%'}}></div>
                    </div>
                    <div className="chat-header-title" style={{ flexGrow: 1, fontWeight: 'bold' }}>
                        Siêu Thị Điện Máy - Nội Thất Chợ Lớn
                    </div>
                    <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center' }}>
                        {/* Nút refresh/reset chat (tạm thời không có chức năng) */}
                        <button title="Làm mới" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '5px' }}>
                             <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6m0-10.5v.5a8 8 0 1 1 9.4 7.1l-.8 1.2c-1.9-2.5-4.6-4-9.6-4C7.3 11 4 14.3 4 18c0 1.2.3 2.3.8 3.3l-1.4.8C2.9 20.4 2 19.2 2 18c0-3.9 3.1-7 7-7 2.5 0 4.9 1.3 6.3 3.2l1.5-1.3c-2.3-3.1-6-5.2-10.3-5.2-4.6 0-8.5 3.5-9 8L2.5 6"/></svg>
                        </button>
                         {/* Nút đóng/thu nhỏ */} {/* Sử dụng toggleChatWindow để đóng */} 
                        <button title="Đóng chat" onClick={toggleChatWindow} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Message Area */}
                <div className="chat-box" ref={chatBoxRef} style={{ flexGrow: 1, padding: '10px', overflowY: 'auto', backgroundColor: '#f0f0f0' }}>
                    {messages.map((msg, index) => (
                        <div key={index} className={`chat-bubble ${msg.sender}-message`} style={{ marginBottom: '10px', maxWidth: '80%', borderRadius: '8px', padding: '8px', alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start', backgroundColor: msg.sender === 'user' ? '#007bff' : '#e9e9eb', color: msg.sender === 'user' ? 'white' : '#333' }}>
                            {/* Bạn có thể cần xử lý hiển thị HTML hoặc các loại tin nhắn khác ở đây */}
                            {msg.text}
                        </div>
                    ))}
                </div>

                {/* Quick Actions (Optional) */}


                {/* Input Area */}
                <div className="chat-input-container" style={{ display: 'flex', alignItems: 'center', padding: '10px', borderTop: '1px solid #ccc' }}>
                     {/* Biểu tượng menu hoặc tùy chọn khác ở đây */}
                     <div className="chat-input-menu-icon" style={{ marginRight: '10px', cursor: 'pointer' }}>
                         {/* Thay bằng icon menu của bạn */}
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
                     </div>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Nhập tin nhắn..."
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !isSending) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        style={{ flexGrow: 1, padding: '8px', borderRadius: '20px', border: '1px solid #ccc', marginRight: '10px' }}
                    />
                    <button type="button" className="send-button" onClick={sendMessage} disabled={isSending} style={{ background: '#007bff', color: 'white', border: 'none', borderRadius: '50%', width: '35px', height: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSending ? 'not-allowed' : 'pointer' }}>
                         {/* Biểu tượng gửi */}
                         <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y2="2" x2="11" y1="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="chat-disclaimer" style={{ fontSize: '10px', textAlign: 'center', padding: '5px', borderTop: '1px solid #eee', color: '#666' }}>
                     Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo. Anh chị vui lòng liên hệ hotline để biết thêm chi tiết: 1900.2628.
                </div>

                {/* Powered by */}
                 <div className="chat-powered-by" style={{ fontSize: '10px', textAlign: 'right', padding: '5px', color: '#666' }}>
                     Powered by <span style={{ fontWeight: 'bold', color: 'green' }}>🌿 Easy AI Chat</span>
                 </div>
            </div>
        </div>
    );
};

export default Chatbot;
