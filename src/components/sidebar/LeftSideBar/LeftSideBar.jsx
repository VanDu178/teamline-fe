import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import UserInforModal from "../../modal/UserInforModal/UserInforModal";
import SettingsModal from "../../modal/SettingsModal/SettingsModal";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import axiosInstance from "../../../configs/axiosInstance";
import { IoIosNotifications } from "react-icons/io";
import { FaMessage } from "react-icons/fa6";
import { useChat } from "../../../contexts/ChatContext";
import NotificationItem from "../../notification/NotificationItem/NotificationItem";
import "./LeftSideBar.css";

const LeftSideBar = () => {
    const [isAvataOpen, setIsAvataOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [messageCount, setMessageCount] = useState(3);
    const [activeIcon, setActiveIcon] = useState(null);
    const { setChats, chatsRef, setMessages, notifications, setNotifications, notificationCount, setNotificationCount, notificationCountRef, notificationRef } = useChat();
    const { user, setUser, setIsAuthenticated, setUserId } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const sidebarRef = useRef(null);
    const [cursor, setCursor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef();
    const notificationsToMarkReadRef = useRef(new Set());
    const notificationsToDismissRef = useRef(new Set());
    const didMountRef = useRef(false);
    const prevIsNotificationOpenRef = useRef(isNotificationOpen);

    useEffect(() => {
        // axiosInstance.patch("/notifications/mark-all-read");

        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsAvataOpen(false);
                setActiveIcon(null);
                setIsNotificationOpen(false);
                setCursor(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!isNotificationOpen || notifications.length === 0) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const notificationId = entry.target.dataset.notificationId;
                        const timer = setTimeout(() => {
                            notificationsToMarkReadRef.current.add(notificationId);
                            observer.unobserve(entry.target);
                        }, 5000);
                        entry.target.timer = timer;
                    } else {
                        if (entry.target.timer) {
                            clearTimeout(entry.target.timer);
                            entry.target.timer = null;
                        }
                    }
                });
            },
            { threshold: 0.5 }
        );

        const notificationElements = document.querySelectorAll(".notif-item");
        notificationElements.forEach((el) => observer.observe(el));

        return () => {
            notificationElements.forEach((el) => {
                if (el.timer) clearTimeout(el.timer);
                observer.unobserve(el);
            });
        };
    }, [isNotificationOpen, notifications]);

    useEffect(() => {
        if (!didMountRef.current) {
            didMountRef.current = true;
            prevIsNotificationOpenRef.current = isNotificationOpen;
            return;
        }

        if (prevIsNotificationOpenRef.current === true && isNotificationOpen === false) {
            const idsToMarkRead = Array.from(notificationsToMarkReadRef.current);
            const idsToDismiss = Array.from(notificationsToDismissRef.current);

            if (idsToMarkRead.length > 0) {
                markNotificationsAsRead(idsToMarkRead)
                    .then(() => {
                        setNotificationCount(prev => prev - idsToMarkRead.length);
                        notificationsToMarkReadRef.current.clear();
                    })
                    .catch(error => console.error("Error handling notifications:", error));
            }

            if (idsToDismiss.length > 0) {
                dismissNotifications(idsToDismiss)
                    .then(() => {
                        notificationsToDismissRef.current.clear();
                    })
                    .catch(error => console.error("Error deleting notifications:", error));
            }
        }

        prevIsNotificationOpenRef.current = isNotificationOpen;
    }, [isNotificationOpen]);


    const markNotificationsAsRead = async (notificationIds) => {
        try {
            await axiosInstance.patch("/notifications/mark-read", { notificationIds: Array.from(notificationIds) });
        } catch (error) {
            console.error("Failed to mark notifications as read:", error);
        }
    };

    const dismissNotifications = async (notificationIds) => {
        try {
            await axiosInstance.patch("/notifications/dismiss-multiple", {
                notificationIds: Array.from(notificationIds)
            });
        } catch (error) {
            console.error("Failed to delete notifications:", error);
        }
    };


    useEffect(() => {
        if (isNotificationOpen) {
            setNotifications([]);
            setCursor(null);
            loadMore();
        }
    }, [isNotificationOpen]);

    useEffect(() => {
        notificationRef.current = notifications;
    }, [notifications]);

    useEffect(() => {
        notificationCountRef.current = notificationCount;
    }, [notificationCount]);

    useEffect(() => {
        if (!isNotificationOpen) return;
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isLoading && cursor !== null) {
                loadMore();
            }
        });
        if (loadMoreRef.current) observer.observe(loadMoreRef.current);
        return () => observer.disconnect();
    }, [isLoading, cursor, isNotificationOpen]);

    const fetchNotifications = async (cursor = null) => {
        const params = { limit: 10 };
        if (cursor) params.cursor = cursor;
        const res = await axiosInstance.get("/notifications", { params });
        return res.data;
    };

    const loadMore = async () => {
        setIsLoading(true);
        const data = await fetchNotifications(cursor);
        if (cursor) {
            setNotifications(prev => [...prev, ...data.items]);
        } else {
            setNotifications(data.items);
        }
        setCursor(data.nextCursor);
        setIsLoading(false);
    };

    const handleIconClick = (iconName) => {
        if (iconName !== "avatar" && isAvataOpen) {
            setIsAvataOpen(false);
        }
        if (iconName === "notification") {
            if (!isNotificationOpen) {
                setCursor(null);
            }
            setIsNotificationOpen(!isNotificationOpen);
        }
        setActiveIcon(activeIcon === iconName ? null : iconName);
    };

    const handleAvatarClick = () => {
        setIsAvataOpen(!isAvataOpen);
        setIsNotificationOpen(false);
        setActiveIcon(activeIcon === "avatar" ? null : "avatar");
    };

    const handleOpenUserInfoModal = () => {
        setIsUserInfoModalOpen(true);
        setIsAvataOpen(false);
        setActiveIcon(null);
    };

    const handleCloseSettingsModal = () => {
        setIsAvataOpen(false);
        setIsSettingsModalOpen(false);
    };

    const handleOpenSettingModal = () => {
        setIsSettingsModalOpen(true);
    };

    const logout = async () => {
        await axiosInstance.post("/auth/logout");
        setIsAuthenticated(false);
        setUser(null);
        setUserId(null);
        setChats([]);
        chatsRef.current = [];
        setMessages([]);
        Cookies.remove("isLoggedIn");
        Cookies.remove("userID");
        Cookies.remove("user");
    };



    const handleDeleteNotification = (notifId) => {
        notificationsToDismissRef.current.add(notifId);
        setNotifications(prev => prev.filter(n => n._id !== notifId));
    };


    return (
        <div className="leftsidebar" ref={sidebarRef}>
            <div className="avatar-container">
                <img
                    src={user?.avatar || imgUserDefault}
                    alt="avatar"
                    className={`avatar ${activeIcon === "avatar" ? "active" : ""}`}
                    onClick={handleAvatarClick}
                    onError={(e) => (e.target.src = imgUserDefault)}
                />
                {isAvataOpen && (
                    <div className="avatar-box">
                        <ul className="avatar-list">
                            <li className="avatar-item" onClick={handleOpenUserInfoModal}>Xem thông tin</li>
                            <li className="avatar-item" onClick={logout}>Đăng xuất</li>
                            <li className="avatar-item" onClick={handleOpenSettingModal}>Cài đặt</li>
                        </ul>
                    </div>
                )}
            </div>
            <span className={`icon ${activeIcon === "notification" ? "active" : ""}`} onClick={() => handleIconClick("notification")}>
                <IoIosNotifications />
                {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </span>
            <span className={`icon ${activeIcon === "chat" ? "active" : ""}`} onClick={() => handleIconClick("chat")}>
                <FaMessage />
                {messageCount > 0 && <span className="badge">{messageCount}</span>}
            </span>
            <UserInforModal isOpen={isUserInfoModalOpen} setIsUserInfoModalOpen={setIsUserInfoModalOpen} />
            <SettingsModal
                isOpen={isSettingsModalOpen}
                onClose={handleCloseSettingsModal}
                theme={isDarkMode ? "Tối" : "Sáng"}
                setTheme={(newTheme) => toggleTheme()}
            />
            {isNotificationOpen && (
                <div className="notif-sidebar">
                    <div className="notif-header">
                        <h3>Thông báo</h3>
                    </div>
                    <div className="notif-body">
                        {notifications.length > 0 ? (
                            <ul className="notif-list">
                                {notifications.map((notif) => (
                                    <NotificationItem
                                        key={notif._id}
                                        notification={notif}
                                        onDelete={handleDeleteNotification}
                                    />
                                    //  <NotificationItem 
                                    // key = { notif._id }
                                    //     notification={notification} 
                                    //     onDelete={handleDelete}
                                    //     onRepost={handleRepost}
                                    //     onReply={handleReply}
                                    // />
                                ))}
                                {cursor && (
                                    <li ref={loadMoreRef} className="notif-load-more">
                                        {isLoading ? "Đang tải…" : "Scroll để tải thêm"}
                                    </li>
                                )}
                            </ul>
                        ) : (
                            <p className="notif-empty">Không có thông báo nào.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeftSideBar;