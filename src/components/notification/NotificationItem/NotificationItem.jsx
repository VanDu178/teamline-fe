import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical, BsReply, BsHeartFill, BsChatFill, BsTrash, BsArrowRepeat } from "react-icons/bs";
import "./NotificationItem.css";

const NotificationItem = ({ notification, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const getIcon = () => {
        switch (notification.type) {
            case "like":
                return <BsHeartFill className="notif-icon" style={{ color: "#ef4444" }} />;
            case "comment":
                return <BsChatFill className="notif-icon" style={{ color: "#3b82f6" }} />;
            default:
                return <div className="notif-icon-default"></div>;
        }
    };

    // Đóng menu khi click bên ngoài
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const toggleMenu = (e) => {
        e.stopPropagation();
        setIsMenuOpen(!isMenuOpen);
    };

    const handleDelete = (e) => {
        e.stopPropagation();
        onDelete(notification._id);
        setIsMenuOpen(false);
    };
    return (
        <li
            data-notification-id={notification._id}
            className={`notif-item ${!notification.isRead ? 'unread' : ''}`}
        >
            <div className="notif-icon-container">
                {getIcon()}
            </div>
            <div className="notif-content">
                <div className="notif-message">{notification.message}</div>
                <div className="notif-meta">
                    <span className="notif-time">
                        notification.createdAt
                    </span>
                </div>
            </div>

            <div className="notif-menu-container" ref={menuRef}>
                <button
                    className="notif-menu-btn"
                    onClick={toggleMenu}
                >
                    <BsThreeDotsVertical />
                </button>

                {isMenuOpen && (
                    <div className="notif-dropdown-menu" >
                        <button className="notif-dropdown-item" onClick={handleDelete}>
                            <BsTrash className="dropdown-icon" />
                            <span>Xóa thông báo</span>
                        </button>
                    </div>
                )}
            </div>
        </li>
    );
};

export default NotificationItem;