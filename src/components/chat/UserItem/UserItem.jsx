import React from "react";
import './UserItem.css';
import { useChat } from '../../../contexts/ChatContext';
import { emitSocketEvent } from '../../../configs/socketEmitter';

const ChatItem = ({ name, avatar }) => {
    console.log("ten", name)
    const handleClick = () => {

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