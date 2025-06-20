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
    const [notificationCount, setNotificationCount] = useState(5); // giả lập số lượng thông báo
    const [activeIcon, setActiveIcon] = useState(null);
    const { setChats, chatsRef, setMessages } = useChat();
    const { user, setUser, setIsAuthenticated, setUserId } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const sidebarRef = useRef(null);

    const notifications = [
        { id: 1, message: "Bạn được Trường thêm vào nhóm tìm việc làm nodejs", time: "10:00 AM" },
        { id: 2, message: "Bạn có yêu cầu kết bạn từ Nguyễn Trung Trực", time: "09:30 AM" },
        { id: 3, message: "Đặng Trung Lợi đã thêm bạn vào nhóm", time: "08:15 AM" },
        { id: 4, message: "Thông báo hệ thống: Cập nhật phiên bản mới", time: "Hôm qua" },
        { id: 5, message: "Nâng cấp cơ chế bảo mật", time: "2 ngày trước" },
    ];

    const handleAvatarClick = () => {
        setIsAvataOpen(!isAvataOpen);
        setIsNotificationOpen(false);
        setActiveIcon(activeIcon === "avatar" ? null : "avatar");
    };

    const handleIconClick = (iconName) => {
        if (iconName !== "avatar" && isAvataOpen) {
            setIsAvataOpen(false);
        }
        if (iconName === "notification") {
            setIsNotificationOpen(!isNotificationOpen);
            //reset số lượng thông báo về lại bằng 0 khi đóng khung thông báo 
            //sau này có thể xử lý theo logic khác
            if (isNotificationOpen) setNotificationCount(0);
        }
        setActiveIcon(activeIcon === iconName ? null : iconName);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsAvataOpen(false);
                setActiveIcon(null);
                setIsNotificationOpen(false); //Đóng khung thông báo 
                setNotificationCount(0); //Set số lượng thông báo về 0
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


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
                                    <li key={notif.id} className="notif-item">
                                        <span className="notif-message">{notif.message}</span>
                                        <span className="notif-time">{notif.time}</span>
                                    </li>
                                ))}
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