import { createContext, useContext, useState, useRef, useEffect } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [roomId, _setRoomId] = useState('');
    const [toUserId, setToUserId] = useState('');
    const roomIdRef = useRef('');
    const [chats, setChats] = useState([]);
    const chatsRef = useRef([]);
    const isSearchingRef = useRef(false);
    const [notifications, setNotifications] = useState([]);
    const [notificationCount, setNotificationCount] = useState(null);
    const notificationRef = useRef([]);
    const notificationCountRef = useRef(null)



    // Hàm set đồng bộ cả state và ref
    const setRoomId = (id) => {
        _setRoomId(id);
        roomIdRef.current = id; // Cập nhật giá trị hiện tại
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                roomId,
                setRoomId,
                roomIdRef,
                toUserId,
                setToUserId,
                chats,
                setChats,
                chatsRef,
                isSearchingRef,
                notifications,
                setNotifications,
                notificationRef,
                notificationCount,
                setNotificationCount,
                notificationCountRef
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
