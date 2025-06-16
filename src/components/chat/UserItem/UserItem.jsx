import React from "react";
import './UserItem.css';
import { useChat } from '../../../contexts/ChatContext';
import { emitSocketEvent } from '../../../configs/socketEmitter';
import { generateLocalChatId } from '../../../utils/chatIdUtils';

const ChatItem = ({ name, avatar, userId, chatId }) => {
    const { roomId, setRoomId, setMessages, setToUserId } = useChat();

    const handleClick = () => {
        const localeChatId = generateLocalChatId();
        //trường hợp chat mới
        if (chatId === null) {
            setRoomId(localeChatId);
            setToUserId(userId);
            return;
        }

        if (roomId === chatId) {
            return;
        }
        if (roomId) {
            emitSocketEvent('leave-room', { roomId });
            setMessages([]);
        }

        setRoomId(chatId);
    }
    return (
        <div className="chat-item" onClick={handleClick}>
            <img src={avatar} alt={`${name}'s avatar`} className="chat-avatar" />
            <div className="chat-details">
                <div className="chat-name">{name}</div>
            </div>
        </div>
    )
};

export default ChatItem;