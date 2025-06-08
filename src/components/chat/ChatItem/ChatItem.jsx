import React from "react";
import './ChatItem.css';

const ChatItem = ({ name, time, message, avatar }) => (
  <div className="chat-item">
    <img src={avatar} alt={`${name}'s avatar`} className="chat-avatar" />
    <div className="chat-details">
      <div className="chat-name">{name}</div>
      <div className="chat-message">Bạn: {message}</div>
    </div>
    <div className="chat-time">{time}</div>
  </div>
);

export default ChatItem;