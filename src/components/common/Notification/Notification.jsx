import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaTimes } from "react-icons/fa";
import "./Notification.css";

const Notification = ({ type = "success", message, onClose, duration = 3000 }) => {
    useEffect(() => {
        if (!message) return;

        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [message, duration, onClose]);

    if (!message) return null;

    return (
        <div className={`notification ${type}`}>
            <div className="notification-icon">
                {type === "success" ? <FaCheckCircle /> : <FaTimesCircle />}
            </div>
            <div className="notification-message">{message}</div>
            <button className="notification-close" onClick={onClose}>
                <FaTimes />
            </button>
        </div>
    );
};

export default Notification;