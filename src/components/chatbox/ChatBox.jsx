import React, { useState, useEffect, useRef } from 'react';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from "../../contexts/AuthContext";
import axiosInstance from '../../configs/axiosInstance';
import ClipLoader from "react-spinners/ClipLoader";
import { isLocalChatId } from '../../utils/chatIdUtils';
import { formatMessageDate } from '../../utils/dateUtils';
import RightSideBar from "../sidebar/RightSideBar/index/index";
import { uploadInChunks } from "../../utils/upload";
import { toast } from 'react-toastify';
import { useWarning } from "../../hooks/useWarning";



import 'bootstrap/dist/css/bootstrap.min.css';
import './ChatBox.css';

const ChatBox = () => {
    const { messages, setMessages, roomId, roomIdRef, toUserId, setToUserId } = useChat();
    const [message, setMessage] = useState('');
    const { userId } = useAuth();
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isscroll, setIsscroll] = useState(false);
    const [lockScroll, setLockScroll] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);
    const [textAreaRows, setTextAreaRows] = useState(1);

    const messagesEndRef = useRef(null);
    const scrollHeightBeforeRef = useRef(0);
    const chatMessagesRef = useRef(null);
    const textareaRef = useRef(null);

    const fileInputRef = useRef(null);
    // const [uploadInProgress, setUploadInProgress] = useState(false); 
    const [uploadProgressMap, setUploadProgressMap] = useState({}); // lưu % tiến trình từng file



    //Cảnh báo người dùng nếu họ reload trang hoặc chuyển tap nhưng có tiến trình upload đang chạy
    // useWarning(uploadInProgress, "Bạn đang thực hiện gửi file, nếu thoát có thể gây hủy tiến trình", () => {
    //     //call xuống backend để xóa mọi tiến trình của chat này.
    // });

    useEffect(() => {
        if (roomId && !isLocalChatId(roomId)) {
            fetchMessages(1);
        }
    }, [roomId]);

    const [contextMenu, setContextMenu] = useState({
        visible: false,
        message: null,
        position: { x: 0, y: 0 }
    });

    const scrollToBottom = (isInstant) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: isInstant ? 'auto' : 'smooth'
        });
    };

    useEffect(() => {
        if (lockScroll) {
            setLockScroll(false);
            return;
        }
        //khi isscroll(được set sau khi call fetch message khi croll gần top)= true thì mới giữ nguyên scroll
        if (currentPage > 1 && chatMessagesRef.current && isscroll) {
            chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight - scrollHeightBeforeRef.current - 110;
            setIsscroll(false);
            return;
        }
        //các trường hợp còn lại :fetch tin nhắn lúc đầu,gửi tin nhắn thì croll xuống cuối
        scrollToBottom(true);

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
        const handleScroll = () => {

            if (!chatMessagesRef.current || loading || !hasMore) return;

            const { scrollTop } = chatMessagesRef.current;

            if (scrollTop < 100) { // Khi scroll gần top
                setIsscroll(true);
                fetchMessages(currentPage + 1, true);
            }
        };

        const chatMessagesElement = chatMessagesRef.current;
        chatMessagesElement.addEventListener('scroll', handleScroll);

        return () => {
            chatMessagesElement.removeEventListener('scroll', handleScroll);
        };
    }, [currentPage, loading, hasMore]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            // Nếu context menu đang mở và click nằm ngoài context menu
            if (contextMenu.visible && !event.target.closest('.context-menu')) {
                closeContextMenu();
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [contextMenu.visible]);

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

    const handleSendMessage = (messageType = "text", fileUrl = null, fileName = null, mimeType = null) => {
        const localId = Date.now() + Math.random(); // ID tạm thời duy nhất
        if ((message || (fileUrl && fileName && mimeType)) && roomId) {
            emitSocketEvent('send-message', {
                roomId,
                message: message || null,
                toUserId,
                localId,
                replyTo: replyMessage?._id || null,
                fileUrl,
                fileName,
                mimeType,
                messageType,
            });
            setMessages((prev) => [
                ...prev,
                {
                    messageId: null,
                    localId, // Gắn ID tạm thời
                    sender: {
                        _id: userId,
                    },
                    content: message || null,
                    type: messageType,
                    fileUrl: fileUrl,
                    fileName: fileName,
                    mimeType: mimeType,
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
        } else {
            console.log('Vui lòng nhập tin nhắn và ID người nhận');
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

    // Hàm nhóm tin nhắn theo ngày
    const groupMessagesByDate = (messages) => {
        const grouped = {};

        messages.forEach((msg) => {
            let dateKey;

            if (msg.updatedAt) {
                // Ưu tiên createdAt trước
                dateKey = formatMessageDate(msg.updatedAt);
            } else {
                // Tin nhắn local chưa có timestamp
                dateKey = 'Hôm nay';
            }

            if (!grouped[dateKey]) {
                grouped[dateKey] = [];
            }
            grouped[dateKey].push(msg);
        });

        return grouped;
    };

    const handleContextMenu = (e, message) => {
        e.preventDefault();
        e.stopPropagation();

        // Ước lượng kích thước menu
        const menuWidth = 200;
        const menuHeight = 300;
        const windowWidth = window.innerWidth;
        const windowHeight = window.innerHeight;

        // Xác định vị trí mặc định
        let x = e.clientX;
        let y = e.clientY + 10;

        // Điều chỉnh cho tin nhắn của mình (hiện bên trái)
        if (message?.sender?._id === userId) {
            x = Math.min(x, windowWidth - menuWidth - 10); // Giữ khoảng cách an toàn
            x = x - menuWidth - 10; // Di chuyển sang trái
        }
        // Đối với tin nhắn người khác giữ nguyên (hiện bên phải)
        else {
            x = Math.min(x, windowWidth - menuWidth - 10); // Giữ khoảng cách an toàn
        }

        // Điều chỉnh chiều dọc nếu menu bị tràn
        if (y + menuHeight > windowHeight) {
            y = windowHeight - menuHeight - 10;
        }

        setContextMenu({
            visible: true,
            message,
            position: { x, y },
            isOwnMessage: message?.sender?._id === userId // Thêm flag để xác định tin nhắn của mình
        });
    };

    const closeContextMenu = () => {
        setContextMenu({ ...contextMenu, visible: false });
    };

    const handleMenuAction = (action, message) => {
        closeContextMenu();

        switch (action) {
            case 'reply':
                handleReply(message);
                break;
            case 'forward':
                // Xử lý chuyển tiếp tin nhắn
                break;
            case 'copy':
                navigator.clipboard.writeText(message.content);
                break;
            case 'pin':
                // Xử lý ghim tin nhắn
                break;
            case 'mark':
                // Xử lý đánh dấu tin nhắn
                break;
            case 'delete':
                // Xử lý xóa tin nhắn
                break;
            case 'recall':
                // Xử lý thu hồi tin nhắn
                break;
            default:
                break;
        }
    };

    // Render phần tin nhắn
    const renderMessages = () => {
        const groupedMessages = groupMessagesByDate(messages);
        return Object.entries(groupedMessages).map(([date, messagesForDate]) => (
            <React.Fragment key={date}>
                <div className="date-divider">
                    <span>{date}</span>
                </div>

                {messagesForDate.map((msg) => (
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
                            <button
                                className="action-btn"
                                title="Khác"
                                onClick={(e) => handleContextMenu(e, msg)}
                            >
                                <i className="fas fa-ellipsis-h"></i>
                            </button>
                        </div>
                        <div className="message-content">
                            {
                                msg?.chat?.type !== 'private' && msg?.sender?._id !== userId &&
                                (
                                    <div className='message-name'>{msg?.sender.name}</div>
                                )
                            }
                            {msg?.type === "text" ?
                                (<div className="message-text">
                                    {msg?.content?.split('\n')?.map((line, index) => (
                                        <React.Fragment key={index}>
                                            {line}
                                            <br />
                                        </React.Fragment>
                                    ))}
                                </div>) : (
                                    <div className="file-content">
                                        <div className="file-icon">
                                            <i className={getFileIcon(msg.mimeType)}></i>
                                        </div>
                                        <div className="file-details">
                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                                                {msg.fileName || 'Unknown File'}
                                            </a>
                                            <span className="file-size">{'46.18 KB'}</span>
                                        </div>
                                        {/* Tiến trình upload nếu chưa có fileUrl */}
                                        {msg.fileUrl === null ? (
                                            uploadProgressMap[msg.localId] < 100 ? (
                                                // Đang upload chunk
                                                <div className="upload-progress-bar">
                                                    <div className="progress-track">
                                                        <div
                                                            className="progress-fill"
                                                            style={{ width: `${uploadProgressMap[msg.localId]}%` }}
                                                        />
                                                    </div>
                                                    <div className="progress-text">
                                                        Đang tải lên: {uploadProgressMap[msg.localId]}%
                                                    </div>
                                                </div>
                                            ) : (
                                                // Đang merge và upload lên Google Drive
                                                <div className="upload-status-processing">
                                                    <span className="processing-text">Đang xử lý file...</span>
                                                </div>
                                            )
                                        ) : (
                                            // Hoàn tất
                                            <a href={msg.fileUrl} download className="download-btn">
                                                <i className="fas fa-download"></i>
                                            </a>
                                        )}

                                    </div>
                                )
                            }
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
                        </button >

                        {/* Nút reaction (chỉ hiện khi có reaction) */}
                        {
                            msg.reactions && msg.reactions.length > 0 && (
                                <button className="reaction-badge">
                                    <i className="fas fa-heart"></i>
                                    <span className="reaction-count">{msg.reactions.length}</span>
                                </button>
                            )
                        }

                        {/* khi người reaction là chính mình thì hiển thị nút xóa reaction */}
                    </div >
                ))}
            </React.Fragment >
        ));
    };


    //Xử lý các sự kiện gửi file, video
    const triggerFileDialog = () => {
        fileInputRef.current.click();
    };

    const handleFileSelection = async (event) => {
        const file = event.target.files[0];
        let localId;
        if (!file) return;

        // Cấu hình giới hạn
        const MAX_FILE_SIZE_MB = 1024; //Giới hạn dung lượng
        const ALLOWED_MIME_PREFIXES = ['image/', 'video/', 'application/pdf', 'text/plain']; //Giới hạn loại file
        const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'jfif']; //Giới hạn loại đuôi ảnh 
        const MAX_FILENAME_LENGTH = 100; //Giới hạn số lượng kí tự của tên file

        try {
            const mimeType = file.type;
            const fileName = file.name;
            const extension = fileName.split('.').pop().toLowerCase();

            // 1. Kiểm tra dung lượng file
            if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
                toast.error(`File vượt quá dung lượng cho phép (${MAX_FILE_SIZE_MB}MB).`);
                return;
            }

            // 2. Kiểm tra loại MIME được hỗ trợ
            const isValidMime = ALLOWED_MIME_PREFIXES.some(prefix => mimeType.startsWith(prefix));
            if (!isValidMime) {
                toast.error('Loại file không được hỗ trợ.');
                return;
            }

            // 3. Kiểm tra độ dài tên file
            if (fileName.length > MAX_FILENAME_LENGTH) {
                toast.error('Tên file quá dài.');
                return;
            }

            // 4. Kiểm tra phần mở rộng tương ứng MIME (ví dụ ảnh nhưng phần mở rộng sai)
            if (mimeType.startsWith('image/') && !IMAGE_EXTENSIONS.includes(extension)) {
                toast.error(`File hình ảnh không hợp lệ. Chỉ chấp nhận các định dạng: ${IMAGE_EXTENSIONS.join(', ')}`);
                return;
            }

            // 5. Xác định loại message
            let messageType = 'file'; // default
            if (mimeType.startsWith('image/')) {
                messageType = 'image';
            } else if (mimeType.startsWith('video/')) {
                messageType = 'video';
            }

            localId = Date.now() + Math.random(); // ID tạm thời duy nhất
            if (fileName && mimeType && roomId) {
                setMessages((prev) => [
                    ...prev,
                    {
                        messageId: null,
                        localId, // Gắn ID tạm thời
                        sender: {
                            _id: userId,
                        },
                        content: message || null,
                        type: messageType,
                        fileUrl: null,
                        fileName: fileName,
                        mimeType: mimeType,
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


                // 6. Gửi tin nhắn
                const response = await uploadInChunks(userId, roomId, file, (percent) => {
                    setUploadProgressMap(prev => ({
                        ...prev,
                        [localId]: percent
                    }));
                });

                const fileUrl = response?.data?.fileUrl;
                emitSocketEvent('send-message', {
                    roomId,
                    message: message || null,
                    toUserId,
                    localId,
                    replyTo: replyMessage?._id || null,
                    fileUrl,
                    fileName,
                    mimeType,
                    messageType,
                });
                // Cleanup upload progress sau khi emit
                setUploadProgressMap(prev => {
                    const { [localId]: _, ...rest } = prev;
                    return rest;
                });
            } else {
                return;
            }
        } catch (error) {
            console.log("Đã có lỗi xảy ra", error);
            toast('Đã xảy ra lỗi khi tải lên file.');
            //xử lý set trạng thái của message là lỗi và hiển thị lỗi
        } finally {
            // Reset input để có thể chọn lại cùng một file
            event.target.value = null;
        }
    };

    const getFileIcon = (mimeType) => {
        if (!mimeType) return "far fa-file";

        if (mimeType.startsWith("image/")) return "far fa-file-image";
        if (mimeType.startsWith("video/")) return "far fa-file-video";
        if (mimeType.startsWith("audio/")) return "far fa-file-audio";
        if (mimeType === "application/pdf") return "far fa-file-pdf";
        if (
            mimeType === "application/msword" ||
            mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) return "far fa-file-word";
        if (
            mimeType === "application/vnd.ms-excel" ||
            mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        ) return "far fa-file-excel";
        if (
            mimeType === "application/vnd.ms-powerpoint" ||
            mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ) return "far fa-file-powerpoint";
        if (mimeType === "application/zip" || mimeType === "application/x-rar-compressed") return "far fa-file-archive";

        return "far fa-file"; // fallback
    };




    return (
        <div className="container-fluid">
            <div className="row">
                {/* ChatBox chiếm 9/12 = 75% */}
                <div className="col-12 col-md-8 p-0">
                    <div className="chat-container">
                        <div className="chat-header">
                            <div className="header-left">
                                <div className="avatar">
                                    <img src="#" alt="avatar" />
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

                        <div className={`chat-messages ${contextMenu.visible ? 'no-scroll' : ''}`} ref={chatMessagesRef}>
                            {loading && (
                                <div style={{ textAlign: 'center', margin: '10px 0' }}>
                                    <ClipLoader color="#36d7b7" size={20} />
                                </div>
                            )}
                            {renderMessages()}
                            <div ref={messagesEndRef} />
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
                                <button className="tool-btn" onClick={triggerFileDialog}>
                                    <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileSelection} />
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

                    {contextMenu.visible && (
                        <div
                            className="context-menu"
                            style={{
                                left: `${contextMenu.position.x}px`,
                                top: `${contextMenu.position.y}px`
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="context-menu-item" onClick={() => handleMenuAction('reply', contextMenu.message)}>
                                <i className="fas fa-reply"></i>
                                <span>Trả lời</span>
                            </div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('forward', contextMenu.message)}>
                                <i className="fas fa-share"></i>
                                <span>Chuyển tiếp</span>
                            </div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('copy', contextMenu.message)}>
                                <i className="fas fa-copy"></i>
                                <span>Sao chép</span>
                            </div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('pin', contextMenu.message)}>
                                <i className="fas fa-thumbtack"></i>
                                <span>Ghim tin nhắn</span>
                            </div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('mark', contextMenu.message)}>
                                <i className="fas fa-bookmark"></i>
                                <span>Đánh dấu tin nhắn</span>
                            </div>
                            <div className="context-menu-divider"></div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('delete', contextMenu.message)}>
                                <i className="fas fa-trash-alt"></i>
                                <span>Xóa chỉ ở phía tôi</span>
                            </div>
                            <div className="context-menu-item" onClick={() => handleMenuAction('recall', contextMenu.message)}>
                                <i className="fas fa-ban"></i>
                                <span>Thu hồi tin nhắn</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RightSidebar chiếm 3/12 = 25% */}
                <div className="col-12 col-md-4 p-0">
                    <RightSideBar />
                </div>
            </div>
        </div>
    );

};

export default ChatBox;