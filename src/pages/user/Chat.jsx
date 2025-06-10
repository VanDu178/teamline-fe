// ChatComponent.js
import React, { useState, useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../../utils/socket';
import '../../styles/chat.css';

const ChatComponent = () => {
    const [socket, setSocket] = useState(null);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([]);
    const [toUserId, setToUserId] = useState('');
    const [show, setShow] = useState(true);

    useEffect(() => {
        // Ngắt kết nối khi rời khỏi component
        return () => {
            disconnectSocket();
        };
    }, []);

    const handleRegister = () => {
        console.log('Đăng ký với userId:', userId);
        if (userId) {
            const newSocket = connectSocket(userId);

            setSocket(newSocket);

            newSocket.on('connect', () => {
                console.log('Connected to server:', newSocket.id);
            });

            newSocket.on('connect_error', (error) => {
                console.error('Connection error:', error);
            });

            newSocket.on('registered', ({ userId, username }) => {
                console.log(`Đăng ký thành công: userId=${userId}, username=${username}`);
                setUserId(userId);
                setUsername(username);
            });

            newSocket.on('private-message', ({ fromUserId, fromUsername, message, messageId, sentAt }) => {
                setMessages((prev) => [
                    ...prev,
                    {
                        fromUserId,
                        fromUsername: fromUsername || 'Người dùng ẩn danh',
                        text: message,
                        time: new Date(sentAt).toLocaleTimeString(),
                    },
                ]);
            });

            newSocket.on('message-sent', (data) => {
                console.log('Message sent confirmation:', data);
            });

            newSocket.on('error', ({ message }) => {
                console.error('Server error:', message);
                alert(`Lỗi: ${message}`);
            });

            setShow(false);
        } else {
            alert('Vui lòng nhập userId');
        }
    };

    const handleSendMessage = () => {
        const currentSocket = getSocket();
        if (currentSocket && message && toUserId) {
            currentSocket.emit('private-message', { toUserId, message });
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
                {show && (
                    <div>
                        <input
                            type="text"
                            value={userId}
                            onChange={(e) => setUserId(e.target.value)}
                            placeholder="Nhập userId (ObjectId)"
                        />
                        <button onClick={handleRegister}>Đăng ký</button>
                    </div>
                )}
                {userId && !show && (
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
                )}
            </div>
        </div>
    );
};

export default ChatComponent;
