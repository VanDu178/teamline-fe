import { useEffect, useState, useRef } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import ChatItem from "../ChatItem/ChatItem";
import UserItem from "../UserItem/UserItem"
import { useAuth } from "../../../contexts/AuthContext";
import { useChat } from "../../../contexts/ChatContext";
import axiosInstance from "../../../configs/axiosInstance";
import imgGroupDefault from "../../../assets/images/img-group-default.jpg";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import CreateGroupModal from "../../modal/CreateGroupModal/CreateGroupModal";
import { getSocket } from "../../../utils/socket";
import { toast } from "react-toastify";

import "./ChatList.css";

const ChatList = () => {
    // const [chats, setChats] = useState([]);
    const { chats, setChats, chatsRef } = useChat();
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [hasMore, setHasMore] = useState(true);
    const listRef = useRef(null);
    const isFetchingRef = useRef(false);
    const [searchValue, setSearchValue] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
    const currentSocket = getSocket();
    const { user } = useAuth();

    const handleCreateGroup = async (groupData) => {
        try {
            const response = await axiosInstance.post("/chats/create-group", {
                name: groupData.name,
                memberIds: groupData.members.map((member) => member._id),
            });

            const newGroup = response?.data?.group;
            console.log(newGroup);
            toast.success("Tạo nhóm thành công!");
            setChats((prev) => [newGroup, ...prev]);

            //Emit socket để thông báo cho các thành viên được thêm vào nhóm
            currentSocket.emit("group-created", {
                newGroup: newGroup
            });

        } catch (error) {
            toast.error("Tạo nhóm thất bại!");
            console.error("Lỗi tạo nhóm:", error);
        }
    };


    const handleSearch = async () => {
        const keyword = searchValue.trim();
        if (!keyword) return;

        setIsSearching(true);
        setIsLoading(true);
        setError(null);

        try {
            const res = await axiosInstance.get(`/users/${keyword}`)
            const user = res?.data?.user;
            setChats(user ? [{ ...user, chatId: res?.data?.chatId }] : []);
            setHasMore(false);
        } catch (err) {
            setError({
                message: "Không tìm thấy người dùng với email đó.",
                retryable: false,
            });
            setChats([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            handleSearch();
        }
    };

    const fetchChats = async () => {
        if (isFetchingRef.current || !hasMore || isSearching) return;

        isFetchingRef.current = true; // dùng để phòng tránh trường hợp người dùng scroll xuống đáy nhiều lần gây chạy trùng lặp 
        setError(null);
        console.log("chay vao fetch chat")
        //chỉ khi nào load lần đầu mới có trạng thái loading..., lúc scroll thì không cần 
        if (chats.length === 0) setIsLoading(true);
        try {
            const lastChat = chats[chats.length - 1];
            const before = lastChat?.timesort;
            const res = await axiosInstance.get("/chats", {
                params: {
                    limit: 15,
                    ...(before && { before }),
                },
            });
            const newChats = Array.isArray(res?.data)
                ? res.data
                : res.data?.data || [];

            setChats((prev) => [...prev, ...newChats]);

            if (newChats.length < 15) setHasMore(false);

        } catch (err) {
            const retryable = err.response?.data?.retryable;
            setError({
                message: "Đã xảy ra lỗi khi tải danh sách chat.",
                retryable,
            });
            console.error("Lỗi khi tải chats:", err);
        } finally {
            setIsLoading(false);
            isFetchingRef.current = false;
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        chatsRef.current = chats;
        const listEl = listRef.current;
        if (!listEl) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = listEl;
            if (scrollTop + clientHeight >= scrollHeight - 200) {
                fetchChats();
            }
        };

        listEl.addEventListener("scroll", handleScroll);
        return () => listEl.removeEventListener("scroll", handleScroll);
    }, [chats]);


    return (
        <div className="chatlist">
            <div className="chatlist-header">
                <div className="chatlist-search">
                    <input
                        placeholder="Tìm kiếm theo email..."
                        className="search-input"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onFocus={() => {
                            setIsInputFocused(true);
                            setChats([]);
                            setIsSearching(false);
                        }}
                        onKeyDown={handleKeyDown}
                    />
                    {isInputFocused && (
                        <button
                            className="search-close-btn"
                            onClick={() => {
                                setIsInputFocused(false);
                                setSearchValue("");
                                setIsSearching(false);
                                setChats([]);
                                setHasMore(true);
                                fetchChats();
                            }}
                        >
                            ✕
                        </button>
                    )}

                </div>
                <span className="create-group-icon" onClick={() => setIsCreateGroupModalOpen(true)}>
                    +
                    <HiMiniUserGroup />
                </span>
            </div>

            {isLoading && chats.length === 0 ? (
                <div className="loading-state">Đang tải...</div>
            ) : error ? (
                <div className="error-state">
                    {error.retryable ? (
                        <>
                            <div>Đã xảy ra lỗi, hãy thử lại.</div>
                            <button onClick={fetchChats}>Thử lại</button>
                        </>
                    ) : (
                        <div>{error.message}</div>
                    )}
                </div>
            ) : chats.length === 0 ? (
                <div className="empty-state">
                    {isSearching
                        ? "Không tìm thấy người dùng nào."
                        : "Bạn chưa có cuộc hội thoại nào"}
                </div>
            ) : (
                <div className="chatlist-content" ref={listRef}>
                    {chats.map((item) => {
                        if (isSearching) {
                            return (
                                <UserItem
                                    key={item._id}
                                    name={item?.name}
                                    avatar={item?.avatar || imgUserDefault}
                                    userId={item?._id}
                                    chatId={item?.chatId}
                                />
                            );
                        }

                        const otherUser =
                            item?.type === "private"
                                ? item?.members?.find((member) => member._id.toString() !== user._id.toString())
                                : null;

                        const readed = item?.lastMessage?.seenBy?.some(
                            (seenUser) => seenUser._id.toString() === user._id.toString()
                        );

                        return (
                            <ChatItem
                                key={item._id}
                                name={
                                    otherUser ? (
                                        otherUser.name
                                    ) : (
                                        <>
                                            <HiMiniUserGroup style={{ marginRight: 6 }} />
                                            {item?.name || "Nhóm"}
                                        </>
                                    )
                                }
                                avatar={
                                    otherUser
                                        ? otherUser.avatar || imgUserDefault
                                        : imgGroupDefault
                                }
                                message={
                                    item?.lastMessage?.content ||
                                    item?.lastMessage?.fileUrl ||
                                    "Nhóm mới được tạo"
                                }
                                sender={item?.lastMessage?.sender?._id}
                                chatId={item?._id}
                                readed={readed}
                            />
                        );
                    })}


                    {isLoading && <div className="loading-state">Đang tải thêm...</div>}

                    {!hasMore && !isSearching && !searchValue.trim() && (
                        <div className="end-state">Đã hết cuộc trò chuyện</div>
                    )}

                    {searchValue.trim() && !isSearching && (
                        <div className="search-hint">Nhấn Enter để tìm kiếm người dùng</div>
                    )}
                </div>
            )}
            <CreateGroupModal
                isOpen={isCreateGroupModalOpen}
                onClose={() => setIsCreateGroupModalOpen(false)}
                onCreate={handleCreateGroup}
            />

        </div>

    );
};

export default ChatList;
