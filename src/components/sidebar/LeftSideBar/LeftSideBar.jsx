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
import "./LeftSideBar.css";
import { useChat } from "../../../contexts/ChatContext";


const LeftSideBar = () => {
    const [isAvataOpen, setIsAvataOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false);
    const [messageCount, setMessageCount] = useState(3); // giả lập số lượng tin nhắn
    const [activeIcon, setActiveIcon] = useState(null);
    const { setChats, chatsRef, setMessages, notifications, setNotifications, notificationCount, setNotificationCount, notificationCountRef, notificationRef } = useChat();
    const { user, setUser, setIsAuthenticated, setUserId } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const sidebarRef = useRef(null);
    const [cursor, setCursor] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef();


    //Xử lý khi click ra bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsAvataOpen(false);
                setActiveIcon(null);
                setIsNotificationOpen(false);
                // setNotificationCount(0);
                // notificationCountRef.current = 0;
                setCursor(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Mở notification lần đầu:
    useEffect(() => {
        if (isNotificationOpen) {
            setNotifications([]);
            setCursor(null);
            loadMore();
        }
    }, [isNotificationOpen]);



    //Xử lý khi phần tử được theo dõi hiển thị trong viewport thì sẽ xử lý load thêm 
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



    //Xử lý load danh sách notification 
    const fetchNotifications = async (cursor = null) => {
        console.log("called")
        const params = { limit: 10 };
        if (cursor) params.cursor = cursor;
        const res = await axiosInstance.get("/notifications", { params });
        return res.data;
    };

    const loadMore = async () => {
        setIsLoading(true);
        const data = await fetchNotifications(cursor);

        if (cursor) {
            setNotifications(prev => {
                const updated = [...prev, ...data.items];
                notificationRef.current = updated;
                return updated;
            });
        } else {
            setNotifications(data.items);
            notificationRef.current = data.items;
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
                setCursor(null)
                // setNotificationCount(0); 
            }
            setIsNotificationOpen(!isNotificationOpen);
            //reset số lượng thông báo về lại bằng 0 khi đóng khung thông báo 
            //sau này có thể xử lý theo logic khác

        }
        setActiveIcon(activeIcon === iconName ? null : iconName);
    };

    //Avatar user 
    const handleAvatarClick = () => {
        setIsAvataOpen(!isAvataOpen);
        setIsNotificationOpen(false);
        setActiveIcon(activeIcon === "avatar" ? null : "avatar");
    };


    //UserInfoModal
    const handleOpenUserInfoModal = () => {
        console.log("user", user);
        setIsUserInfoModalOpen(true);
        setIsAvataOpen(false);
        setActiveIcon(null);
    };


    //Modal setting
    const handleCloseSettingsModal = () => {
        setIsAvataOpen(false);
        setIsSettingsModalOpen(false);
    };

    const handleOpenSettingModal = () => {
        setIsSettingsModalOpen(true);
    };


    //Xu ly logout
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
                            <li className="avatar-item" onClick={handleOpenUserInfoModal}>
                                Xem thông tin
                            </li>
                            <li className="avatar-item" onClick={logout}>Đăng xuất</li>
                            <li className="avatar-item" onClick={handleOpenSettingModal}>Cài đặt</li>
                        </ul>
                    </div>
                )}
            </div>


            <span
                className={`icon ${activeIcon === "notification" ? "active" : ""}`}
                onClick={() => handleIconClick("notification")}
            >
                <IoIosNotifications />
                {notificationCount > 0 && <span className="badge">{notificationCount}</span>}
            </span>
            <span
                className={`icon ${activeIcon === "chat" ? "active" : ""}`}
                onClick={() => handleIconClick("chat")}
            >
                <FaMessage />
                {messageCount > 0 && <span className="badge">{messageCount}</span>}
            </span>

            <UserInforModal
                isOpen={isUserInfoModalOpen}
                setIsUserInfoModalOpen={setIsUserInfoModalOpen}
            />
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
                                    <li key={notif._id} className="notif-item">
                                        <span className="notif-message">{notif.message}</span>
                                        <span className="notif-time">{notif.createdAt}</span>
                                    </li>
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