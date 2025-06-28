import React, { useState } from 'react';

const MediaGroup = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

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
                        <span onClick={() => setIsModalOpen(true)}>Xem tất cả</span>
                    </div>
                </>
            )}
            {isModalOpen && (
                <div className="rs-modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="rs-modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 className="rs-modal-title">Ảnh/Video</h3>
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
                            <span onClick={() => setIsModalOpen(false)}>Đóng</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MediaGroup;