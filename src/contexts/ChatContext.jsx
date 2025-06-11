// src/contexts/ChatContext.js
import { createContext, useContext, useState } from 'react';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [userId, setUserId] = useState('');
    const [username, setUsername] = useState('');

    return (
        <ChatContext.Provider value={{ messages, setMessages, userId, setUserId, username, setUsername }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
