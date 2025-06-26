import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import UserInforModal from "../../../modal/UserInforModal/UserInforModal";
import SettingsModal from "../../../modal/SettingsModal/SettingsModal";
import { useAuth } from "../../../../contexts/AuthContext";
import { useTheme } from "../../../../contexts/ThemeContext";
import axiosInstance from "../../../../configs/axiosInstance";
import { IoIosNotifications } from "react-icons/io";
import { FaMessage } from "react-icons/fa6";
import { useChat } from "../../../../contexts/ChatContext"
import NotificationSidebar from "../components/NotificationSidebar/NotificationSidebar"
import AvatarMenu from "../components/AvatarMenu/AvatarMenu"
import useNotificationBoxHandler from "../hooks/useNotificationBoxHandler";
import useAvatarMenu from "../hooks/useAvatarMenu";
import "./index.css";

const LeftSideBar = () => {
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [messageCount, setMessageCount] = useState(3);
    const [activeIcon, setActiveIcon] = useState(null);
    const { setChats, chatsRef, setMessages } = useChat();
    const { user, setUser, setIsAuthenticated, setUserId } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const sidebarRef = useRef(null);

    const {
        isNotificationOpen,
        setIsNotificationOpen,
        notifications,
        notificationCount,
        cursor,
        setCursor,
        isLoading,
        loadMoreRef,
        handleDeleteNotification
    } = useNotificationBoxHandler();


    const { isAvataOpen, setIsAvataOpen, handleAvatarClick, handleOpenUserInfoModal, handleCloseSettingsModal, handleOpenSettingModal } = useAvatarMenu({
        activeIcon, setActiveIcon, setIsUserInfoModalOpen, setIsSettingsModalOpen, setIsNotificationOpen
    });




    useEffect(() => {
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
            <AvatarMenu
                user={user}
                isAvataOpen={isAvataOpen}
                activeIcon={activeIcon}
                handleAvatarClick={handleAvatarClick}
                handleOpenUserInfoModal={handleOpenUserInfoModal}
                handleOpenSettingModal={handleOpenSettingModal}
                logout={logout}
            />
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
                <NotificationSidebar
                    notifications={notifications}
                    cursor={cursor}
                    isLoading={isLoading}
                    loadMoreRef={loadMoreRef}
                    handleDeleteNotification={handleDeleteNotification}
                />
            )}
        </div>
    );
};

export default LeftSideBar;