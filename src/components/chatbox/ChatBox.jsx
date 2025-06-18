import React, { useState, useEffect, useRef } from 'react';
import { setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import './ChatBox.css';
import axiosInstance from '../../configs/axiosInstance';
import ClipLoader from "react-spinners/ClipLoader";
import { isLocalChatId } from '../../utils/chatIdUtils';

const ChatBox = () => {
    const { messages, setMessages, roomId, roomIdRef, toUserId, setToUserId } = useChat();
    const [message, setMessage] = useState('');
    const { userId } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [scrollAfterSending, setScrollAfterSending] = useState(false);
    const [lockScroll, setLockScroll] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);
    const [textAreaRows, setTextAreaRows] = useState(1);

    const messagesEndRef = useRef(null);
    const scrollHeightBeforeRef = useRef(0);
    const chatMessagesRef = useRef(null);
    const textareaRef = useRef(null);

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
            console.log(res);
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
        if (roomId && !isLocalChatId(roomId)) {
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
            emitSocketEvent('send-message', {
                roomId,
                message,
                toUserId,
                localId,
                replyTo: replyMessage?._id || null
            });
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
                    replyTo: replyMessage ? {
                        _id: replyMessage._id,
                        content: replyMessage.content,
                        sender: {
                            _id: replyMessage.sender._id,
                            name: replyMessage.sender.name
                        }
                    } : null,
                    reactions: [],
                    seenBy: [],
                    chat: {
                        _id: roomId,
                        type: "private" // nếu là nhóm thì bạn gán "group"
                    },
                    createdAt: null,
                    updatedAt: null
                },
            ]);
            setMessage('');
            setReplyMessage(null); // Xóa tin nhắn reply sau khi gửi
            setTextAreaRows(1); // Reset số dòng textarea
            setScrollAfterSending(true);
        } else {
            alert('Vui lòng nhập tin nhắn và ID người nhận');
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            if (e.shiftKey) {
                // Tăng số dòng nhưng không quá 3 lần
                if (textAreaRows < 3) {
                    setTextAreaRows(prev => prev + 1);
                }
                return;
            } else {
                e.preventDefault();
                handleSendMessage();
            }
        }
    };

    const handleReply = (message) => {
        setReplyMessage(message);
        textareaRef.current.focus(); // Tập trung vào textarea
    };

    const cancelReply = () => {
        setReplyMessage(null);
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
                        {/* Hiển thị tin nhắn được reply (nếu có) */}
                        {msg.replyTo && (
                            <div className="reply-preview">
                                <div className="reply-sender">
                                    {msg.replyTo.sender
                                        ? (msg.replyTo.sender._id === userId ? "Bạn" : msg.replyTo.sender.name)
                                        : "Đang tải..."
                                    }
                                </div>
                                <div className="reply-content">
                                    {msg.replyTo.content?.length > 50
                                        ? `${msg.replyTo.content.substring(0, 50)}...`
                                        : msg.replyTo.content
                                    }
                                </div>
                            </div>
                        )}
                        <div className="message-actions">
                            <button
                                className="action-btn"
                                title="Trả lời"
                                onClick={() => handleReply(msg)}
                            >
                                <i className="fas fa-reply"></i>
                            </button>
                            <button className="action-btn" title="Chuyển tiếp">
                                <i className="fas fa-share"></i>
                            </button>
                            <button className="action-btn" title="Khác">
                                <i className="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
                        <div className="message-content">
                            {
                                msg?.chat?.type != 'private' && msg?.sender?._id != userId &&
                                (
                                    <div className='message-name'>{msg?.sender.name}</div>
                                )
                            }
                            <div className="message-text">
                                {msg?.content?.split('\n')?.map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </div>
                            <div className="message-time">
                                {msg.hasOwnProperty('updatedAt') ? (
                                    msg.updatedAt ? (
                                        new Date(msg.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                    ) : (
                                        <ClipLoader color="#36d7b7" size={10} />
                                    )
                                ) : (
                                    <span style={{ color: 'red' }}>! gửi lỗi</span>
                                )}
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

            {replyMessage && (
                <div className="reply-preview-container">
                    <div className="reply-preview-content">
                        <div className="reply-preview-header">
                            <span>Trả lời {replyMessage.sender._id === userId ? "bạn" : replyMessage.sender.name}</span>
                            <button className="cancel-reply-btn" onClick={cancelReply}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="reply-preview-text">
                            {replyMessage.content.length > 50
                                ? `${replyMessage.content.substring(0, 50)}...`
                                : replyMessage.content}
                        </div>
                    </div>
                </div>
            )}

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
                        ref={textareaRef}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder="Nhập tin nhắn..."
                        className="input-message"
                        rows={textAreaRows}
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