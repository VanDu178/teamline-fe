import React, { useState, useEffect, useRef } from "react";
import "./LeftSideBar.css";
import UserInfo from "../../../components/modal/UserInfor/UserInfor"; // Nhập modal

const Sidebar = () => {
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isAvataOpen, setIsAvataOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false); // State cho modal
    const [activeIcon, setActiveIcon] = useState(null);
    const [userInfo, setUserInfo] = useState({
        name: "Nguyen Van A",
        email: "nguyenvana@example.com",
        phone: "0901234567",
    }); // Dữ liệu mẫu
    const [editedInfo, setEditedInfo] = useState({ ...userInfo }); // Dữ liệu đang chỉnh sửa
    const sidebarRef = useRef(null);

    const handleSettingsClick = () => {
        setIsSettingsOpen(!isSettingsOpen);
        setActiveIcon(activeIcon === "settings" ? null : "settings");
    };

    const handleAvatarClick = () => {
        setIsAvataOpen(!isAvataOpen);
        setActiveIcon(activeIcon === "avatar" ? null : "avatar");
    };

    const handleIconClick = (iconName) => {
        if (iconName !== "settings" && iconName !== "avatar" && (isSettingsOpen || isAvataOpen)) {
            setIsSettingsOpen(false);
            setIsAvataOpen(false);
        }
        setActiveIcon(activeIcon === iconName ? null : iconName);
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
        setEditedInfo({ ...userInfo }); // Reset dữ liệu chỉnh sửa khi mở modal
    };

    const handleSaveChanges = () => {
        setUserInfo({ ...editedInfo }); // Lưu thay đổi vào userInfo
        setIsModalOpen(false); // Đóng modal
        alert("Thông tin đã được cập nhật!");
    };

    const handleCancel = () => {
        setIsModalOpen(false); // Đóng modal mà không lưu
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
                setIsAvataOpen(false);
                setActiveIcon(null);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div className="leftsidebar" ref={sidebarRef}>
            <div className="avatar-container">
                <img
                    src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFrY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
                    alt="avatar"
                    className={`avatar ${activeIcon === "avatar" ? "active" : ""}`}
                    onClick={handleAvatarClick}
                />
                {isAvataOpen && (
                    <div className="avatar-box">
                        <ul className="avatar-list">
                            <li className="avatar-item">Chỉnh sửa ảnh đại diện</li>
                            <li className="avatar-item" onClick={handleOpenModal}>
                                Xem thông tin
                            </li>
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

            <UserInfo
                isOpen={isModalOpen}
                onClose={handleCancel}
                onSave={handleSaveChanges}
                userInfo={editedInfo}
                onChange={setEditedInfo}
            />
        </div>
    );
};

export default Sidebar;