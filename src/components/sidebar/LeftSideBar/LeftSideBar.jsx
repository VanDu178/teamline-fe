import { useState, useEffect, useRef } from "react";
import Cookies from "js-cookie";
import UserInforModal from "../../modal/UserInforModal/UserInforModal";
import SettingsModal from "../../modal/SettingsModal/SettingsModal";
import { useAuth } from "../../../contexts/AuthContext";
import { useTheme } from "../../../contexts/ThemeContext";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import axiosInstance from "../../../configs/axiosInstance";
import "./LeftSideBar.css";
import { useChat } from "../../../contexts/ChatContext";


const LeftSideBar = () => {
    const [isAvataOpen, setIsAvataOpen] = useState(false);
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
    const [activeIcon, setActiveIcon] = useState(null);
    const { setChats, chatsRef, setMessages } = useChat();
    const { user, setUser, setIsAuthenticated, setUserId } = useAuth();
    const { isDarkMode, toggleTheme } = useTheme();
    const sidebarRef = useRef(null);

    const handleAvatarClick = () => {
        setIsAvataOpen(!isAvataOpen);
        setActiveIcon(activeIcon === "avatar" ? null : "avatar");
    };

    const handleIconClick = (iconName) => {
        if (iconName !== "avatar" && isAvataOpen) {
            setIsAvataOpen(false);
        }
        setActiveIcon(activeIcon === iconName ? null : iconName);
    };


    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsAvataOpen(false);
                setActiveIcon(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);


    //UserInfoModal
    const handleOpenUserInfoModal = () => {
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
                className={`icon ${activeIcon === "chat" ? "active" : ""}`}
                onClick={() => handleIconClick("chat")}
            >
                💬
            </span>
            <span
                className={`icon ${activeIcon === "group" ? "active" : ""}`}
                onClick={() => handleIconClick("group")}
            >
                👥
            </span>
            <span
                className={`icon ${activeIcon === "lock" ? "active" : ""}`}
                onClick={() => handleIconClick("lock")}
            >
                🔒
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
        </div>
    );
};

export default LeftSideBar;