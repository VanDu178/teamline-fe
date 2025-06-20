import { useState } from "react";
import './UserItem.css';
import { useChat } from '../../../contexts/ChatContext';
import { emitSocketEvent } from '../../../configs/socketEmitter';
import { generateLocalChatId } from '../../../utils/chatIdUtils';
import UserInforModal from "../../modal/UserInforModal/UserInforModal";
import { useAuth } from "../../../contexts/AuthContext";

const ChatItem = ({ name, avatar, userId, chatId }) => {
    const { roomId, setRoomId, setMessages, setToUserId } = useChat();
    const [isUserInfoModalOpen, setIsUserInfoModalOpen] = useState(false);
    const { user } = useAuth();
    const handleClick = () => {
        //nếu search chính mình khi click vào thì hiện form thông tin
        if (user._id === userId) {
            setIsUserInfoModalOpen(true);
            return;
        }
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
        <>
            <div className="chat-item" onClick={handleClick}>
                <img src={avatar} alt={`${name}'s avatar`} className="chat-avatar" />
                <div className="chat-details">
                    <div className="chat-name">{name}</div>
                </div>
            </div>


            <UserInforModal
                isOpen={isUserInfoModalOpen}
                setIsUserInfoModalOpen={setIsUserInfoModalOpen}
            />
        </>

    )
};

export default ChatItem;