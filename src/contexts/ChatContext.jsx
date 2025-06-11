import { createContext, useContext, useState, useRef } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');
    const [activeChatUserId, _setActiveChatUserId] = useState('');
    const activeChatUserIdRef = useRef('');

    // Hàm set đồng bộ cả state và ref
    const setActiveChatUserId = (id) => {
        _setActiveChatUserId(id);
        activeChatUserIdRef.current = id; // Cập nhật giá trị hiện tại
    };

    return (
        <ChatContext.Provider
            value={{
                messages,
                setMessages,
                userId,
                setUserId,
                username,
                setUsername,
                activeChatUserId,
                setActiveChatUserId,
                activeChatUserIdRef, // Truyền ref ra ngoài
            }}
        >
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
