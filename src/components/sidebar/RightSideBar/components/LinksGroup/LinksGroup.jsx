import React, { useState } from 'react';

const LinksGroup = () => {
    const [isOpen, setIsOpen] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="rs-group-links">
            <div className="rs-section-header">
                <span className="rs-section-title">Link</span>
                <button className="rs-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '▼' : '▲'}
                </button>
            </div>
            {isOpen && (
                <>
                    <div className="rs-section">
                        <div className="rs-link-list">
                            <div className="rs-link-item">Lời mẹo vần hôm Nguyễn Nhật Trường... <span>24/06</span></div>
                            <div className="rs-link-item">💾 SSD S6 1 VN | ổ Cứng SSD PC, SSD... <span>23/06</span></div>
                            <div className="rs-link-item">https://www.thegioididong.com/lapto... <span>23/06</span></div>
                            <div className="rs-link-item">www.thegioididong.com <span>23/06</span></div>
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
                        <h3 className="rs-modal-title">Link</h3>
                        <div className="rs-section">
                            <div className="rs-link-list">
                                <div className="rs-link-item">Lời mẹo vần hôm Nguyễn Nhật Trường... <span>24/06</span></div>
                                <div className="rs-link-item">💾 SSD S6 1 VN | ổ Cứng SSD PC, SSD... <span>23/06</span></div>
                                <div className="rs-link-item">https://www.thegioididong.com/lapto... <span>23/06</span></div>
                                <div className="rs-link-item">www.thegioididong.com <span>23/06</span></div>
                            </div>
                            <div className="rs-section rs-view-all">
                                <span onClick={() => setIsModalOpen(false)}>Đóng</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LinksGroup;