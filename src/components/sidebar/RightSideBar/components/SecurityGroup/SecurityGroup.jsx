import React, { useState } from 'react';

const SecurityGroup = () => {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <div className="rs-group-security">
            <div className="rs-section-header">
                <span className="rs-section-title">Thiết lập bảo mật</span>
                <button className="rs-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '▼' : '▲'}
                </button>
            </div>
            {isOpen && (
                <div className="rs-section rs-security-settings">
                    <div className="rs-security-options">
                        <div className="rs-security-option">
                            <span className="rs-option-icon">⏳ Tin nhắn tự xóa ?</span>
                            <span className="rs-option-subtext">Không bao giờ</span>
                        </div>
                        <div className="rs-security-option">
                            <span className="rs-option-icon">👁️ Ẩn trò chuyện</span>
                            <label className="rs-switch">
                                <input type="checkbox" />
                                <span className="rs-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityGroup;