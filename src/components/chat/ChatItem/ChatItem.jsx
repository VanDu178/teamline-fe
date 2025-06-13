import React from "react";
import './ChatItem.css';
import { useChat } from '../../../contexts/ChatContext';
import { emitSocketEvent } from '../../../configs/socketEmitter';

const ChatItem = ({ name, time, message, avatar, chatId }) => {
  const { roomId, setRoomId, setMessages } = useChat();
  const handleClick = () => {
    if (roomId === chatId) {
      return;
    }
    if (roomId) {
      emitSocketEvent('leave-room', { roomId });
      setMessages([]);
    }

    setRoomId(chatId);
  };
  return (
    <div className="chat-item" onClick={handleClick}>
      <img src={avatar} alt={`${name}'s avatar`} className="chat-avatar" />
      <div className="chat-details">
        <div className="chat-name">{name}</div>
        <div className="chat-message">Bạn: {message}</div>
      </div>
      <div className="chat-time">{time}</div>
    </div>
  )
};

export default ChatItem;