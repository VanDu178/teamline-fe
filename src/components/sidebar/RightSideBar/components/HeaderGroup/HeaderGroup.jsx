import React from 'react';

const HeaderGroup = () => (
    <div className="rs-group-header">
        <h2 className="rs-sidebar-title">Thông tin hội thoại</h2>
        <div className="rs-user-info">
            <img src="#" alt="User avatar" className="rs-user-avatar" />
            <div className="rs-user-details">
                <div className="rs-user-name">Đặng Trung Lor</div>
            </div>
        </div>
        <div className="rs-sidebar-actions">
            <button className="rs-action-btn" title="Tắt thông báo">🔕</button>
            <button className="rs-action-btn" title="Ghim hội thoại">📌</button>
            <button className="rs-action-btn" title="Tạo nhóm trò chuyện">👥</button>
        </div>
    </div>
);

export default HeaderGroup;