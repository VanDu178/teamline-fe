import React from "react";
import './RightSideBar.css';

const RightSidebar = () => (
    <div className="right-sidebar">
        <div className="user-info">
            <img
                src="https://via.placeholder.com/40"
                alt="User avatar"
                className="user-avatar"
            />
            <div className="user-details">
                <div className="user-name">Đặng Trung Lor</div>
                <div className="user-status">Đang hoạt động</div>
            </div>
        </div>
        <div className="sidebar-tabs">
            <div className="tab active">Thông tin hồ sơ</div>
            <div className="tab">Danh sách nhắn</div>
            <div className="tab">Ảnh/Video</div>
            <div className="tab">File</div>
        </div>
        <div className="sidebar-actions">
            <button className="action-btn">Tắt thông báo</button>
            <button className="action-btn">Ghim hội thoại</button>
            <button className="action-btn">Tạo nhóm trò chuyện</button>
        </div>
    </div>
);

export default RightSidebar;