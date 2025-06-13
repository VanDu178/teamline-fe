import React, { useState, useEffect, use } from 'react';
import { setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import './ChatBox.css';
import axiosInstance from '../../configs/axiosInstance';

const ChatBox = () => {
    const { messages, setMessages, roomId, roomIdRef, toUserId, setToUserId } = useChat();
    const [message, setMessage] = useState('');
    const { userId } = useAuth();

    useEffect(() => {
        const fetchMessages = async () => {
            const page = 1; // Giả sử bạn muốn lấy trang đầu tiên
            const res = await axiosInstance.get(`/messages/${roomIdRef?.current}/${page}`);
            console.log('res', res.data);
            console.log("userId", userId);
            if (res.status === 200) {
                setMessages(res.data.messages);
            }
        };

        fetchMessages();
    }, [roomId]);

    const handleAddReaction = async (messageId) => {
        try {
            // Gửi socket event hoặc gọi API để thêm reaction
            emitSocketEvent('add-reaction', { messageId });

            // Cập nhật UI ngay (cập nhật tạm thời, nếu cần)
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, reactions: [...msg.reactions, userId] }
                        : msg
                )
            );
        } catch (error) {
            console.error('Lỗi khi thêm reaction:', error);
        }
    };

    const handleRemoveReaction = async (messageId) => {
        try {
            // Gửi socket event hoặc gọi API để xóa reaction
            emitSocketEvent('remove-reaction', { messageId, userId });

            // Cập nhật UI ngay (cập nhật tạm thời, nếu cần)
            setMessages((prevMessages) =>
                prevMessages.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, reactions: msg.reactions.filter((id) => id !== userId) }
                        : msg
                )
            );
        } catch (error) {
            console.error('Lỗi khi xóa reaction:', error);
        }
    };

    const handleSendMessage = () => {
        if (message && roomId) {
            emitSocketEvent('send-message', { roomId, message, toUserId });
            setMessages((prev) => [
                ...prev,
                {
                    sender: {
                        _id: userId,
                    },
                    content: message,
                    type: "text",
                    fileUrl: null,
                    replyTo: null,
                    reactions: [],
                    seenBy: [],
                    chat: roomId,
                    createdAt: new Date(),
                    updatedAt: new Date()
                },
            ]);
            setMessage('');
        } else {
            alert('Vui lòng nhập tin nhắn và ID người nhận');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Nếu nhấn Shift + Enter thì cho phép xuống dòng
                return;
            } else {
                // Nếu chỉ nhấn Enter thì gửi tin nhắn
                e.preventDefault(); // Ngăn xuống dòng (nếu đang dùng textarea)
                handleSendMessage();
            }
        }
    }

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
                        className={`message-container ${msg?.sender?._id === userId ? 'sent' : 'received'}`}
                    >
                        <div className="message-content">
                            <div className="message-text">
                                {msg?.content?.split('\n')?.map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="message-time">
                                {new Date(msg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>

                        {/* Nút tim (chưa tim/đã tim) */}
                        <button className={`heart-btn ${msg?.reactions?.includes(userId) ? 'reacted' : ''}`}>
                            <i
                                className={msg?.reactions?.includes(userId) ? "fas fa-heart" : "far fa-heart"}
                                onClick={() => {
                                    if (msg?.reactions?.includes(userId)) {
                                        handleRemoveReaction(msg._id); // Ví dụ: hàm bỏ tim
                                    } else {
                                        handleAddReaction(msg._id); // Ví dụ: hàm thả tim
                                    }
                                }}
                            >

                            </i>
                        </button>

                        {/* Nút reaction (chỉ hiện khi có reaction) */}
                        {msg.reactions && msg.reactions.length > 0 && (
                            <button className="reaction-badge">
                                <i className="fas fa-heart"></i>
                                <span className="reaction-count">{msg.reactions.length}</span>
                            </button>
                        )}

                        {/* khi người reaction là chính mình thì hiển thị nút xóa reaction */}
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
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
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

export default ChatBox;