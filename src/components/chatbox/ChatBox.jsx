import React, { useState, useEffect, useRef } from 'react';
import { setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import './ChatBox.css';
import axiosInstance from '../../configs/axiosInstance';
import ClipLoader from "react-spinners/ClipLoader";

const ChatBox = () => {
    const { messages, setMessages, roomId, roomIdRef, toUserId, setToUserId } = useChat();
    const [message, setMessage] = useState('');
    const { userId } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scrollAfterSending, setScrollAfterSending] = useState(false);
    const [lockScroll, setLockScroll] = useState(false);

    const messagesEndRef = useRef(null);
    const scrollHeightBeforeRef = useRef(0);
    const chatMessagesRef = useRef(null);

    const scrollToBottom = (isInstant) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isInstant ? 'auto' : 'smooth'
        });
    };

    useEffect(() => {
        if (lockScroll) {
            setLockScroll(false);
        }
        else if (currentPage === 1 || scrollAfterSending) {
            scrollToBottom(true);
        } else if (currentPage > 1 && chatMessagesRef.current) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight - scrollHeightBeforeRef.current - 110;
            //100 bù cho khi tới top còn 100 là load thêm dữ liệu
        }
        setScrollAfterSending(false);

    }, [messages]);

    const fetchMessages = async (page, isLoadMore = false) => {
        try {
            setLoading(true);
            if (isLoadMore && chatMessagesRef.current) {
                scrollHeightBeforeRef.current = chatMessagesRef.current.scrollHeight;
            }

            const res = await axiosInstance.get(`/messages/${roomIdRef?.current}/${page}`);
            if (res.status === 200) {
                if (isLoadMore) {
                    setMessages((prevMessages) => [...res.data.messages, ...prevMessages]);
                } else {
                    setMessages(res.data.messages);
                }

                setCurrentPage(page);
                setHasMore(page < res.data.totalPages);
            }
        } catch (error) {
            console.error("Lỗi khi load tin nhắn:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (roomId) {
            fetchMessages(1);
        }
    }, [roomId]);

    useEffect(() => {
        const handleScroll = () => {
            if (!chatMessagesRef.current || loading || !hasMore) return;

            const { scrollTop } = chatMessagesRef.current;

            if (scrollTop < 100) { // Khi scroll gần top
                fetchMessages(currentPage + 1, true);
            }
        };

        const chatMessagesElement = chatMessagesRef.current;
        chatMessagesElement.addEventListener('scroll', handleScroll);

        return () => {
            chatMessagesElement.removeEventListener('scroll', handleScroll);
        };
    }, [currentPage, loading, hasMore]);

    const handleAddReaction = async (messageId) => {
        try {
            // Gửi socket event hoặc gọi API để thêm reaction
            emitSocketEvent('add-reaction', { messageId });
            setLockScroll(true);

        } catch (error) {
            console.error('Lỗi khi thêm reaction:', error);
        }
    };

    const handleRemoveReaction = async (messageId) => {
        try {
            // Gửi socket event hoặc gọi API để xóa reaction
            emitSocketEvent('remove-reaction', { messageId, userId });
            setLockScroll(true);
        } catch (error) {
            console.error('Lỗi khi xóa reaction:', error);
        }
    };

    const handleSendMessage = () => {
        const localId = Date.now() + Math.random(); // ID tạm thời duy nhất

        if (message && roomId) {
            emitSocketEvent('send-message', { roomId, message, toUserId, localId });
            setMessages((prev) => [
                ...prev,
                {
                    messageId: null,
                    localId, // Gắn ID tạm thời
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
                    createdAt: null,
                    updatedAt: null
                },
            ]);
            setMessage('');
            setScrollAfterSending(true);
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

            <div className="chat-messages" ref={chatMessagesRef}>
                {loading && (
                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                        <ClipLoader color="#36d7b7" size={20} />
                    </div>
                )}
                <div className="date-divider">
                    <span>Hôm nay</span>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg._id || msg.localId}
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
                                {
                                    msg.createdAt ? (new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    ) : (<ClipLoader color="#36d7b7" size={10} />
                                    )
                                }
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
                    ref={messagesEndRef}
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