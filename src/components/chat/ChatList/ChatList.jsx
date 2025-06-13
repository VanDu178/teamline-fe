import { useEffect, useState, useRef } from "react";
import ChatItem from "../ChatItem/ChatItem";
import axiosInstance from "../../../configs/axiosInstance";
import "./ChatList.css";

const ChatList = () => {
    const [chats, setChats] = useState([]);
    const [error, setError] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const listRef = useRef(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log("call ")
        fetchChats(page);
    }, [page]);

    useEffect(() => {
        const handleScroll = () => {
            const container = listRef.current;
            if (!container || isLoading || !hasMore) return;

            if (container.scrollTop + container.clientHeight >= container.scrollHeight - 100) {
                setPage((prev) => prev + 1);
            }
        };

        const container = listRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }

        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [isLoading, hasMore]);

    const fetchChats = async (pageNumber) => {
        try {
            const response = await axiosInstance.get(`/chats?page=${pageNumber}&limit=10`);
            const newChats = response.data?.chatsWithLastMessage || [];
            const total = response.data?.total || 0;

            setChats((prev) => [...prev, ...newChats]);
            setHasMore(chats.length + newChats.length < total);
        } catch (err) {
            console.error("Error fetching chats:", err);
            setError(true);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="chatlist">
            <div className="chatlist-search">
                <input placeholder="Tìm kiếm..." className="search-input" />

            </div>

            {isLoading && chats.length === 0 ? (
                <div className="loading-state">Đang tải...</div>
            ) : error ? (
                <div className="error-state">
                    Có lỗi xảy ra, vui lòng thử lại!
                    <button onClick={fetchChats(page)}>Tải lại</button>
                </div>
            ) : chats.length === 0 ? (
                <div className="empty-state">Bạn chưa có cuộc hội thoại nào</div>
            ) : (
                <div className="chatlist-content" ref={listRef}>
                    {chats.map((chat, idx) => (
                        <ChatItem
                            key={idx}
                            name={chat.name}
                            time={chat.lastMessage?.createdAt}
                            message={chat.lastMessage?.text}
                            avatar={chat.members?.[0]?.avatar}
                        />
                    ))}
                    {isLoading && <div className="loading-state">Đang tải thêm...</div>}
                    {!hasMore && <div className="end-state">Hết cuộc hội thoại</div>}
                </div>
            )}
        </div>
    );
};

export default ChatList;