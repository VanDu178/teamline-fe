import React from "react";
import './ChatItem.css';
import { useChat } from '../../../contexts/ChatContext';
import { useAuth } from "../../../contexts/AuthContext"
import { emitSocketEvent } from '../../../configs/socketEmitter';

const ChatItem = ({ name, time, message, avatar, chatId, sender, readed }) => {
  const { roomId, setRoomId, setMessages } = useChat();
  const { user } = useAuth();
  const handleClick = () => {
    //nếu người dùng đang trong đoạn chat thì không cần làm gì cả.
    if (roomId === chatId) {
      return;
    }
    //nếu không trong chatbox đó + có tồn tại roomId
    if (roomId) {
      emitSocketEvent('leave-room', { roomId });
      setMessages([]);
    }
    //nếu không đang trong chatbox nào + render chatbox lần đầu 
    setRoomId(chatId);
  };
  return (
    <div className="chat-item" onClick={handleClick}>
      <img src={avatar} alt={`${name}'s avatar`} className="chat-avatar" />
      <div className="chat-details">
        <div className="chat-name">{name}</div>
        <div className="chat-message-wrapper">
          <div className={`chat-message ${!readed ? "unread" : ""}`}>
            {user._id === sender ? `Bạn: ${message}` : message}
          </div>
          {!readed && <span className="unread-dot" />}
        </div>
      </div>
      <div className="chat-time">{time}</div>
    </div>
  )
};

export default ChatItem;