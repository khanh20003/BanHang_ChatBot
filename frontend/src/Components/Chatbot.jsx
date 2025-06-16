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

    // Lưu lại customerId trước đó để phát hiện thay đổi
    const prevCustomerIdRef = useRef(customerId);
    const enterPressedRef = useRef(false);

    // Hàm để toggle cửa sổ chat
    const toggleChatWindow = () => {
        setIsOpen(!isOpen);
    };

    // Hàm gửi tin nhắn
    const sendMessage = async () => {
        if (isSending) return;
        const messageToSend = inputMessage.trim();
        if (messageToSend === '') return;
        setIsSending(true);
        setInputMessage('');

        // Không lặp tin nhắn user nếu đã có ở cuối
        setMessages(prevMessages => {
            if (prevMessages.length && prevMessages[prevMessages.length - 1].sender === 'user' && prevMessages[prevMessages.length - 1].text === messageToSend) {
                return prevMessages;
            }
            return [...prevMessages, { text: messageToSend, sender: 'user' }];
        });

        if (!customerId) {
            setMessages(prevMessages => [...prevMessages, { text: "Lỗi: Không có thông tin khách hàng để gửi tin nhắn.", sender: 'bot' }]);
            setIsSending(false);
            return;
        }

        const apiUrl = 'http://127.0.0.1:8000/chat/';

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: messageToSend,
                    customer_id: customerId
                })
            });

            function countLastUserMessages(messages, text) {
                let count = 0;
                for (let i = messages.length - 1; i >= 0; i--) {
                    if (messages[i].sender === 'user' && messages[i].text === text) {
                        count++;
                    } else {
                        break;
                    }
                }
                return count;
            }

            if (!response.ok) {
                const errorData = await response.json();
                setMessages(prevMessages => {
                    const userCount = countLastUserMessages(prevMessages, messageToSend);
                    return [
                        ...prevMessages,
                        ...(userCount === 0 ? [{ text: messageToSend, sender: 'user' }] : []),
                        { text: `Lỗi: ${errorData.detail || response.statusText}`, sender: 'bot' }
                    ];
                });
                setIsSending(false);
                return;
            }

            const responseData = await response.json();
            const botMessages = [];
            if (responseData && responseData.response) {
                botMessages.push({ text: responseData.response, sender: 'bot', type: 'text' });
            }
            if (responseData && responseData.products && responseData.products.length > 0) {
                botMessages.push({ type: 'product_list', data: responseData.products, sender: 'bot' });
            }
            setMessages(prevMessages => {
                const userCount = countLastUserMessages(prevMessages, messageToSend);
                if (botMessages.length > 0) {
                    return [
                        ...prevMessages,
                        ...(userCount === 0 ? [{ text: messageToSend, sender: 'user' }] : []),
                        ...botMessages
                    ];
                } else {
                    return [
                        ...prevMessages,
                        ...(userCount === 0 ? [{ text: messageToSend, sender: 'user' }] : []),
                        { text: "Bot không trả lời.", sender: 'bot', type: 'text' }
                    ];
                }
            });
        } catch (error) {
            setMessages(prevMessages => {
                const userCount = countLastUserMessages(prevMessages, messageToSend);
                return [
                    ...prevMessages,
                    ...(userCount === 0 ? [{ text: messageToSend, sender: 'user' }] : []),
                    { text: "Lỗi kết nối đến server.", sender: 'bot', type: 'text' }
                ];
            });
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

    // Reset chat khi customerId thay đổi (ví dụ: logout, login tài khoản khác)
    useEffect(() => {
        if (prevCustomerIdRef.current !== customerId) {
            setMessages([
                { text: 'Chào mừng Anh Chị đến với Siêu Thị Điện máy - Nội thất Chợ Lớn! Em là trợ lý AI luôn sẵn lòng hỗ trợ anh chị ạ 😊', sender: 'bot' },
            ]);
            setInputMessage(''); // Đảm bảo input rỗng khi đổi user
            prevCustomerIdRef.current = customerId;
        }
    }, [customerId]);

    // Hàm xử lý click vào nút hành động nhanh (ví dụ)
    const handleQuickAction = (action) => {
        console.log('Quick action clicked:', action);
        // TODO: Gửi action đến backend hoặc xử lý tương ứng
        // Ví dụ: sendMessage(action); // Gửi action như một tin nhắn của người dùng
    };


    // Render message giống giao diện mẫu
    const renderMessage = (msg, index) => {
        if (msg.type === 'product_list' && Array.isArray(msg.data)) {
            return (
                <div key={index} className="chat-bubble bot-message product-list" style={{ background: '#f6fafd', border: '1px solid #e3f0ff', borderRadius: 8, margin: '8px 0', padding: 12 }}>
                    <ol style={{ margin: 0, paddingLeft: 20 }}>
                        {msg.data.map((product, i) => (
                            <li key={i} style={{ marginBottom: 8 }}>
                                <a href={product.url || '#'} target="_blank" rel="noopener noreferrer" style={{ color: '#2196f3', fontWeight: 600, textDecoration: 'underline' }}>{product.name}</a>
                                {product.price && (
                                    <span style={{ color: '#333', fontWeight: 400 }}> - Giá: {product.price.toLocaleString()} VNĐ</span>
                                )}
                            </li>
                        ))}
                    </ol>
                </div>
            );
        }
        // Bot message
        if (msg.sender === 'bot') {
            return (
                <div key={index} className="chat-bubble bot-message" style={{ background: '#f6fafd', color: '#222', borderRadius: 8, margin: '8px 0', padding: 12, alignSelf: 'flex-start', maxWidth: '90%' }}>
                    {msg.text}
                </div>
            );
        }
        // User message
        return (
            <div key={index} className="chat-bubble user-message" style={{ background: '#2196f3', color: 'white', borderRadius: 8, margin: '8px 0', padding: 12, alignSelf: 'flex-end', maxWidth: '90%' }}>
                {msg.text}
            </div>
        );
    };

    return (
        <div className="chat-container" style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000 }}>
            {/* Nút Chat Icon */}
            <button 
                ref={chatButtonRef}
                className="chat-button" 
                onClick={toggleChatWindow} 
                title="Chat với chúng tôi"
                style={{ width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#2196f3', color: 'white', border: 'none', cursor: 'pointer', display: isOpen ? 'none' : 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            </button>

            {/* Chat Window */}
            <div 
                ref={chatWindowRef}
                className="chat-window" 
                style={{ width: '370px', height: '540px', border: '1px solid #e3f0ff', display: 'none', flexDirection: 'column', borderRadius: '10px', overflow: 'hidden', boxShadow: '0 5px 40px rgba(0,0,0,0.13)' }}
            >
                {/* Header */}
                <div className="chat-header" style={{ backgroundColor: '#2196f3', color: 'white', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div className="chat-header-logo" style={{ marginRight: '10px' }}>
                        <img src="/vite.svg" alt="logo" style={{ width: 32, height: 32, borderRadius: '50%', background: '#fff' }} />
                    </div>
                    <div className="chat-header-title" style={{ flexGrow: 1, fontWeight: 'bold', fontSize: 18 }}>
                        Điện máy XANH
                    </div>
                    <div className="chat-header-actions" style={{ display: 'flex', alignItems: 'center' }}>
                        <button title="Làm mới" style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', marginRight: '5px' }} onClick={() => setMessages([{ text: 'Chào mừng Anh Chị đến với Siêu Thị Điện máy - Nội thất Chợ Lớn! Em là trợ lý AI luôn sẵn lòng hỗ trợ anh chị ạ 😊', sender: 'bot' }])}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.5 2v6h-6M2.5 22v-6h6m0-10.5v.5a8 8 0 1 1 9.4 7.1l-.8 1.2c-1.9-2.5-4.6-4-9.6-4C7.3 11 4 14.3 4 18c0 1.2.3 2.3.8 3.3l-1.4.8C2.9 20.4 2 19.2 2 18c0-3.9 3.1-7 7-7 2.5 0 4.9 1.3 6.3 3.2l1.5-1.3c-2.3-3.1-6-5.2-10.3-5.2-4.6 0-8.5 3.5-9 8L2.5 6"/></svg>
                        </button>
                        <button title="Đóng chat" onClick={toggleChatWindow} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                </div>

                {/* Message Area */}
                <div className="chat-box" ref={chatBoxRef} style={{ flexGrow: 1, padding: '16px 14px', overflowY: 'auto', backgroundColor: '#f6fafd', display: 'flex', flexDirection: 'column' }}>
                    {messages.map(renderMessage)}
                </div>

                {/* Input Area */}
                <div className="chat-input-container" style={{ display: 'flex', alignItems: 'center', padding: '12px 14px', borderTop: '1px solid #e3f0ff', background: '#fff' }}>
                    <input
                        type="text"
                        className="chat-input"
                        placeholder="Nhập tin nhắn..."
                        value={inputMessage}
                        onChange={e => setInputMessage(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter' && !isSending && !e.repeat) {
                                e.preventDefault();
                                sendMessage();
                            }
                        }}
                        style={{ flexGrow: 1, padding: '10px 16px', borderRadius: '20px', border: '1px solid #e3f0ff', marginRight: '10px', fontSize: 15, background: '#fafdff' }}
                    />
                    <button
                        type="button"
                        className="send-button"
                        tabIndex={-1}
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => { if (!isSending) sendMessage(); }}
                        disabled={isSending}
                        style={{ background: '#2196f3', color: 'white', border: 'none', borderRadius: '50%', width: '38px', height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: isSending ? 'not-allowed' : 'pointer' }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y2="2" x2="11" y1="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>

                {/* Disclaimer */}
                <div className="chat-disclaimer" style={{ fontSize: '11px', textAlign: 'center', padding: '6px 12px 2px 12px', borderTop: '1px solid #e3f0ff', color: '#888' }}>
                    Thông tin chỉ mang tính tham khảo, được tư vấn bởi Trí Tuệ Nhân Tạo
                </div>
                <div className="chat-powered-by" style={{ fontSize: '10px', textAlign: 'right', padding: '5px', color: '#bbb' }}>
                    Powered by <span style={{ fontWeight: 'bold', color: '#2196f3' }}>AI</span>
                </div>
            </div>
        </div>
    );
};

export default Chatbot;
