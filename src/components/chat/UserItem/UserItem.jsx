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

        //đang ở ngoai click vào thì có bao nhieu TH 

        // -đang nằm trong chatbox đó luôn -> không cần load tin nhắn cũng không cần làm gì cả-> return 
        // -đang ở ngoài chatbox đó 
        // -đã có chat trước đó rồi: -> có chatId -> chỉ cần hiển thị chatbox + load tin nhắn + load reaction
        // -chưa có chat trước đó: -> chatId = null -> làm gì??? 
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