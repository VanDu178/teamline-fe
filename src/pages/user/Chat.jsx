import React, { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import '../../styles/chat.css';

const ChatComponent = () => {
    const { userId, setUserId, username, setUsername, messages, setMessages } = useChat();
    const [message, setMessage] = useState('');
    const [toUserId, setToUserId] = useState('');
    const { isAuthenticated } = useAuth();

    useEffect(() => {
        if (!isAuthenticated) {
            const newSocket = connectSocket();
            setChatStore({ setMessages, setUserId, setUsername }); // Truyền store context vào socketEvents nếu cần dùng chung

            registerSocketEvents(newSocket); // Đăng ký sự kiện socket
        }

        // Ngắt kết nối khi rời khỏi component
        return () => {
            disconnectSocket();
        };
    }, [setMessages, setUserId, setUsername]);

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
                <h3>Chat App</h3>
            </div>
            <div className="chat-messages">
                {messages.map((msg, index) => (
                    <div
                        key={index}
                        className={`message ${msg.fromUserId === userId ? 'sent' : 'received'}`}
                    >
                        <p>
                            {msg.text} <span className="time">({msg.time})</span>
                        </p>
                        <span className="username">{msg.fromUsername}</span>
                    </div>
                ))}
            </div>
            <div className="chat-input">
                <>
                    <input
                        type="text"
                        value={toUserId}
                        onChange={(e) => setToUserId(e.target.value)}
                        placeholder="Nhập ID người nhận (ObjectId)"
                    />
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Nhập tin nhắn"
                    />
                    <button onClick={handleSendMessage}>Gửi</button>
                </>
            </div>
        </div>
    );
};

export default ChatComponent;
