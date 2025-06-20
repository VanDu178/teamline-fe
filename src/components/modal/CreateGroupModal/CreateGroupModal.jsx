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
                !isLoading
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
        setIsLoading(true);
        try {
            const res = await axiosInstance.get(`/users/${query}`);
            const fetchedUsers = [res.data?.user].filter(Boolean);
            setUsers(fetchedUsers);
            setHasMore(true);
        } catch (err) {
            setUsers([]);
            console.error("Search users error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchUsers = async (cursorId = null) => {
        if (isLoading || !hasMore) return;
        setIsLoading(true);
        try {
            const res = await axiosInstance.get("/users/connected-users", {
                params: {
                    limit: 10,
                    ...(cursorId && { lastId: cursorId }),
                },
            });
            const fetchedUsers = res.data?.users || [];
            setUsers((prev) => (cursorId ? [...prev, ...fetchedUsers] : fetchedUsers));
            setCursor(res.data?.nextCursor);
            setHasMore(res.data?.hasMore);
        } catch (err) {
            toast.error("Không thể tải danh sách người dùng!");
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
        onCreate({
            name: groupName.trim(),
            members,
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

    // Merge `users` và `selectedUsers` để luôn render user đã chọn
    const displayedUsers = Array.from(
        new Map([...users.map((u) => [u._id, u]), ...selectedUsers]).values()
    );

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
                            {isLoading && users.length === 0 && (
                                <p>Đang tải danh sách người dùng...</p>
                            )}
                            {users.map((user) => (
                                <div
                                    key={user._id}
                                    className="cgm-member-item"
                                    onClick={() => handleToggleMember(user)}
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.has(user._id)}
                                        readOnly
                                    />
                                    <img src={user.avatar || imgUserDefault} alt={user.name} />
                                    <span>{user.name}</span>
                                </div>
                            ))}
                            {isLoading && users.length > 0 && (
                                <p style={{ textAlign: "center", marginTop: 10 }}>Đang tải thêm...</p>
                            )}
                            {!hasMore && users.length > 0 && (
                                <p style={{ textAlign: "center", marginTop: 10 }}>Đã hết người dùng</p>
                            )}
                            {!isLoading && displayedUsers.length === 0 && (
                                <p style={{ textAlign: "center", marginTop: 10 }}>Không tìm thấy người dùng</p>
                            )}
                        </div>
                        <div className="cgm-selected-members">
                            <h3>Đã chọn: {selectedUsers.size}/100</h3>
                            {Array.from(selectedUsers.values()).map((user) => (
                                <div key={user._id} className="cgm-selected-member">
                                    <img src={user.avatar || imgUserDefault} alt={user.name} />
                                    <span>{user.name}</span>
                                    <button onClick={() => handleToggleMember(user)}>×</button>
                                </div>
                            ))}
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
