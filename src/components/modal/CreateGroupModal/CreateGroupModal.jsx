import React, { useState, useEffect, useRef } from "react";
import { HiMiniUserGroup } from "react-icons/hi2";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import { toast } from "react-toastify";
import axiosInstance from "../../../configs/axiosInstance";
import { emailValidator } from "../../../utils/validation";
import "./CreateGroupModal.css";

const CreateGroupModal = ({ isOpen, onClose, onCreate }) => {
    const [groupName, setGroupName] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedUsers, setSelectedUsers] = useState(new Map());
    const [users, setUsers] = useState([]);
    const [cursor, setCursor] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);
    const listRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            resetModal();
            fetchUsers(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const element = listRef.current;
        if (!element) return;

        const handleScroll = () => {
            if (
                element.scrollTop + element.clientHeight >= element.scrollHeight - 50 &&
                hasMore &&
                !isLoading &&
                cursor !== null
            ) {
                fetchUsers(cursor);
            }
        };

        element.addEventListener("scroll", handleScroll);
        return () => element.removeEventListener("scroll", handleScroll);
    }, [cursor, hasMore, isLoading]);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (searchQuery.trim() === "" && isOpen) {
                fetchUsers(null);
            } else if (emailValidator(searchQuery.trim())) {
                searchUsers(searchQuery.trim());
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [searchQuery]);



    const searchUsers = async (query) => {
        try {
            setIsLoading(true);
            setNotFound(false);
            const res = await axiosInstance.get(`/users/${query}`);
            const user = res.data?.user;
            const chatId = res.data?.chatId;

            const formattedUser = user ? {
                _id: user._id,
                name: user.name,
                avatar: user.avatar,
                chatId: chatId || null
            } : null;

            const fetchedUsers = formattedUser ? [formattedUser] : [];
            setUsers(fetchedUsers);
            setHasMore(true);
            setNotFound(!formattedUser);
        } catch (err) {
            setUsers([]);
            setNotFound(true);
            console.error("Lỗi khi tìm người dùng:", err);
        } finally {
            setIsLoading(false);
        }
    };


    const fetchUsers = async (cursorId = null) => {
        if (isLoading || !hasMore) return;
        try {
            setIsLoading(true);
            const res = await axiosInstance.get("/users/connected-users", {
                params: {
                    limit: 10,
                    ...(cursorId && { lastId: cursorId }),
                },
            });
            const fetchedUsers = res.data?.users || [];
            console.log(fetchedUsers)
            setUsers((prev) => (cursorId ? [...prev, ...fetchedUsers] : fetchedUsers));
            setCursor(res.data?.nextCursor);
            setHasMore(res.data?.hasMore);
        } catch (err) {
            setUsers(prev => prev)
            console.error("Fetch users error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleMember = (user) => {
        setSelectedUsers((prev) => {
            const newMap = new Map(prev);
            if (newMap.has(user._id)) {
                newMap.delete(user._id);
            } else {
                newMap.set(user._id, user);
            }
            return newMap;
        });
    };




    const handleCreateGroup = () => {
        const members = Array.from(selectedUsers.values());

        if (!groupName.trim()) {
            toast.error("Tên nhóm không được để trống");
            return;
        }

        if (members.length < 2) {
            toast.error("Vui lòng chọn ít nhất 2 thành viên");
            return;
        }

        const knownUsers = members.filter((user) => !!user.chatId);
        const unknownUsers = members.filter((user) => !user.chatId);

        console.log(" Người quen:", knownUsers);
        console.log(" Người lạ:", unknownUsers);

        onCreate({
            name: groupName.trim(),
            knownUsers,
            unknownUsers
        });

        handleClose();
    };


    const resetModal = () => {
        setGroupName("");
        setSelectedUsers(new Map());
        setUsers([]);
        setCursor(null);
        setHasMore(true);
        setSearchQuery("");
    };


    const handleClose = () => {
        resetModal();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="cgm-modal-overlay" onClick={handleClose}>
            <div className="cgm-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="cgm-modal-header">
                    <h2>Tạo nhóm</h2>
                    <button className="cgm-modal-close-btn" onClick={handleClose}>×</button>
                </div>
                <div className="cgm-modal-body">
                    <div className="cgm-group-name-input">
                        <label>Nhập tên nhóm...</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Nhập tên nhóm..."
                        />
                    </div>
                    <div className="cgm-member-search">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Nhập email để tìm người dùng ..."
                        />
                        <span className="cgm-search-icon">🔍</span>
                    </div>
                    <div className="cgm-member-container">
                        <div className="cgm-member-list" ref={listRef}>
                            {users.map((user) => (
                                <div
                                    key={user?._id}
                                    className="cgm-member-item"
                                    onClick={() => handleToggleMember(user)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(user?._id)}
                                        readOnly
                                    />
                                    <img src={user?.avatar || imgUserDefault} alt={user?.name} />
                                    <span>{user?.name}</span>
                                </div>
                            ))}
                            {isLoading && (
                                <p style={{ textAlign: "center", marginTop: 10 }}>
                                    {users.length > 0 ? "Đang tải thêm..." : "Đang tải..."}
                                </p>
                            )}
                            {!hasMore && users.length > 0 && (
                                <p style={{ textAlign: "center", marginTop: 10 }}>Đã hết người dùng</p>
                            )}
                            {!isLoading && users.length === 0 && searchQuery.trim() !== "" && notFound && (
                                <p style={{ textAlign: "center", marginTop: 10, color: "red" }}>
                                    Email chưa có người dùng đăng ký
                                </p>
                            )}

                        </div>
                        <div className="cgm-selected-members">
                            <h3>Đã chọn: {selectedUsers.size}/100</h3>
                            {Array.from(selectedUsers.values()).map((user) => {
                                return (
                                    <div key={user?._id} className="cgm-selected-member">
                                        <img src={user?.avatar || imgUserDefault} alt={user?.name} />
                                        <span>{user?.name}</span>
                                        <button onClick={() => handleToggleMember(user)}>×</button>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                </div>
                <div className="cgm-modal-footer">
                    <button className="cgm-btn-cancel" onClick={handleClose}>Hủy</button>
                    <button className="cgm-btn-create" onClick={handleCreateGroup}>Tạo nhóm</button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;