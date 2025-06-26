import { useState, useRef, useEffect } from "react";
import { BsThreeDotsVertical, BsReply, BsHeartFill, BsChatFill, BsTrash, BsArrowRepeat } from "react-icons/bs";
import useNotificationHandler from "../../hooks/useNotificationHandler";

import "./NotificationItem.css";

const NotificationItem = ({ notification, onDelete }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const {
        acceptGroupInvite,
        rejectGroupInvite
    } = useNotificationHandler();

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



    //Xử lý các sự kiện cho loại notification "lời mời vào nhóm chat"

    return (
        <li
            data-notification-info={JSON.stringify({ notificationId: notification._id, isRead: notification.isRead })}
            className={`notif-item ${!notification.isRead ? 'unread' : ''}`}
        >

            <div className="notif-icon-container">
                <div className="notif-icon-default"></div>
            </div>
            <div className="notif-content">
                <div className="notif-message">{notification.message}</div>
                {notification?.type === "group_invite" && <div className="notif-action">
                    <div>
                        <button onClick={() => { rejectGroupInvite(notification?._id) }}>reject</button>
                        <button onClick={() => { acceptGroupInvite(notification?.sourceId, notification?._id) }}>accept</button>
                    </div>
                </div>}
                <div className="notif-meta">
                    <span className="notif-time">
                        {notification.createdAt}
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