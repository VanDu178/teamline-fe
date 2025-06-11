import React, { useState, useEffect, useRef } from "react";
import "./LeftSideBar.css";

const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [activeIcon, setActiveIcon] = useState(null); // Theo dõi icon nào được click
    const sidebarRef = useRef(null);

    const handleSettingsClick = () => {
        setIsSettingsOpen(!isSettingsOpen);
        setActiveIcon(activeIcon === "settings" ? null : "settings"); // Toggle trạng thái active cho settings
    };

    const handleIconClick = (iconName) => {
        // Nếu nhấp vào icon khác ngoài settings, đóng box settings
        if (iconName !== "settings" && isSettingsOpen) {
            setIsSettingsOpen(false);
        }
        setActiveIcon(activeIcon === iconName ? null : iconName); // Toggle trạng thái active cho icon
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
                setActiveIcon(null); // Reset active icon khi nhấp bên ngoài
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="leftsidebar" ref={sidebarRef}>
            <img
                src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFrY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
                alt="avatar"
                className="avatar"
            />
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
            <span
                className={`icon settings ${activeIcon === "settings" ? "active" : ""}`}
                onClick={handleSettingsClick}
            >
                ⚙️
                {isSettingsOpen && (
                    <div className="settings-box">
                        <ul className="settings-list">
                            <li className="settings-item">Thông tin tài khoản</li>
                            <li className="settings-item">Đăng xuất</li>
                        </ul>
                    </div>
                )}
            </span>
        </div>
    );
};

export default Sidebar;