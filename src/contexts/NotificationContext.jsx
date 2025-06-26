import { createContext, useContext, useState, useRef, useEffect } from 'react';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(null);
    const notificationRef = useRef([]);
    const notificationCountRef = useRef(null)
    const isNotificationOpenRef = useRef(false);
    const notificationsToMarkReadRef = useRef(new Set());
    const notificationsToDismissRef = useRef(new Set());

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                setNotifications,
                notificationRef,
                notificationCount,
                setNotificationCount,
                notificationCountRef,
                isNotificationOpenRef,
                notificationsToMarkReadRef,
                notificationsToDismissRef
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);
