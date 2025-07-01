import React from 'react';
import './MessageItemFile.css';

const MessageItemFile = ({ message, userId }) => {
    const fileName = message.fileUrl?.split('/').pop() || 'Unknown File';
    const fileSize = '46.18 KB'; // You can calculate this dynamically based on the file if available
    const time = message.updatedAt ? new Date(message.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '14:00';

    return (
        <div className="message-item-file">
            <div className="message-content">
                {message?.chat?.type !== 'private' && message?.sender?._id !== userId && (
                    <div className='message-name'>{message?.sender.name}</div>
                )}
                <div className="file-content">
                    <div className="file-icon">

                        {/* <i className="far fa-file-pdf"></i> */}
                        {/* <i class="far fa-file-word"></i> */}
                        {/* <i class="far fa-file-excel"></i> */}
                        {/* <i class="far fa-file-powerpoint"></i> */}
                        {/* <i class="far fa-file-archive"></i> file zip */}
                        {/* <i class="far fa-file-image"></i> */}
                        {/* <i class="far fa-file-video"></i> */}
                        {/* <i class="far fa-file-audio"></i> */}
                    </div>
                    <div className="file-details">
                        <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className="file-name">
                            {fileName}
                        </a>
                        <span className="file-size">{fileSize}</span>
                    </div>
                    <a href={message.fileUrl} download className="download-btn">
                        <i className="fas fa-download"></i>
                    </a>
                </div>
                <div className="message-time">{time}</div>
            </div>
        </div >
    );
};

export default MessageItemFile;