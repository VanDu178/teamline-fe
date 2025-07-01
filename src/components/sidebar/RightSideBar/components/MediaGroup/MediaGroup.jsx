import React, { useState } from 'react';

const MediaGroup = ({ openDropdown }) => {
    const [isOpen, setIsOpen] = useState(true);

    const mediaContent = (
        <div className="rs-media-section">
            <div className="rs-media-grid">
                <div className="rs-media-item"></div>
                <div className="rs-media-item"></div>
                <div className="rs-media-item"></div>
                <div className="rs-media-item"></div>
                <div className="rs-media-item"></div>
                <div className="rs-media-item"></div>
            </div>
        </div>
    );

    return (
        <div className="rs-group-media">
            <div className="rs-section-header">
                <span className="rs-section-title">Ảnh/Video</span>
                <button className="rs-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '▼' : '▲'}
                </button>
            </div>
            {isOpen && (
                <>
                    <div className="rs-media-section">
                        <div className="rs-media-grid">
                            <div className="rs-media-item"></div>
                            <div className="rs-media-item"></div>
                            <div className="rs-media-item"></div>
                            <div className="rs-media-item"></div>
                            <div className="rs-media-item"></div>
                            <div className="rs-media-item"></div>
                        </div>
                    </div>
                    <div className="rs-section rs-view-all">
                        <span onClick={() => openDropdown('Ảnh/Video', mediaContent)}>Xem nhiều hơn</span>
                    </div>
                </>
            )}
        </div>
    );
};

export default MediaGroup;