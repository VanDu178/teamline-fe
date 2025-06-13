import React, { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import '../../styles/chat.css';

const Chat = () => {
    const { userId, setUserId, username, setUsername, messages, setMessages, activeChatUserId, setActiveChatUserId, activeChatUserIdRef } = useChat();
    const [message, setMessage] = useState('');
    const [toUserId, setToUserId] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        //lôi đống này ra ngoài vì luôn connect socket khi vào app
        // *********************************************
        setActiveChatUserId('684b06cb192792007c6a2913'); // Thiết lập ID người dùng chat mặc định
        // *********************************************
        const newSocket = connectSocket();
        setChatStore({ setMessages, setUserId, setUsername, setActiveChatUserId, activeChatUserIdRef }); // Truyền store context vào socketEvents nếu cần dùng chung

        registerSocketEvents(newSocket); // Đăng ký sự kiện socket

        // Ngắt kết nối khi rời khỏi component
        return () => {
            disconnectSocket();
        };
    }, [setMessages, setUserId, setUsername, setActiveChatUserId]);

    const handleSendMessage = () => {
        if (message && toUserId) {
            emitSocketEvent('private-message', { toUserId, message });
            setMessages((prev) => [
                ...prev,
                {
                    fromUserId: userId,
                    fromUsername: username,
                    text: message,
                    time: new Date().toLocaleTimeString(),
                },
            ]);
            setMessage('');
        } else {
            alert('Vui lòng nhập tin nhắn và ID người nhận');
        }
    };

    return (
        <div className="chat-container">
            <div className="chat-header">
                <div className="header-left">
                    <div className="avatar">
                        <img src="https://via.placeholder.com/40" alt="avatar" />
                    </div>
                    <div className="header-info">
                        <h3>Chat-app-team</h3>
                        <p>2 thành viên đang hoạt động</p>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="header-btn">
                        <i className="fas fa-search"></i>
                    </button>
                    <button className="header-btn">
                        <i className="fas fa-ellipsis-v"></i>
                    </button>
                </div>
            </div>

            <div className="chat-messages">
                <div className="date-divider">
                    <span>Hôm nay</span>
                </div>

                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message-container ${msg.fromUserId === userId ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            <div className="message-text">{msg.text}</div>
                            <div className="message-time">
                                {msg.time}
                                {msg.fromUserId === userId && (
                                    <span className="status-icon">
                                        <i className="fas fa-check-double"></i>
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
                <div
                // ref={messagesEndRef} 
                />
            </div>

            <div className="chat-input-container">
                <div className="input-tools">
                    <button className="tool-btn">
                        <i className="fas fa-plus-circle"></i>
                    </button>
                    <button className="tool-btn">
                        <i className="far fa-smile"></i>
                    </button>
                    <button className="tool-btn">
                        <i className="fas fa-paperclip"></i>
                    </button>
                </div>
                <div className="input-message-wrapper">
                    <input
                        type="text"
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        placeholder="Nhập ID người nhận..."
                        className="input-to-user"
                    />
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        // onKeyPress={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="input-message"
                    />
                </div>
                <button
                    onClick={handleSendMessage}
                    className="send-button"
                    disabled={!message}
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
        </div>
    );
};

export default Chat;