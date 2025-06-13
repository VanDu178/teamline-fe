// src/components/modal/UserInfoModal.jsx
import React from "react";
import "./UserInfor.css"

const UserInfoModal = ({ isOpen, onClose, onSave, userInfo, onChange }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Thông tin cá nhân</h2>
                <div className="modal-field">
                    <label>Tên:</label>
                    <input
                        type="text"
                        value={userInfo.name}
                        onChange={(e) => onChange({ ...userInfo, name: e.target.value })}
                    />
                </div>
                <div className="modal-field">
                    <label>Email:</label>
                    <input
                        type="email"
                        value={userInfo.email}
                        onChange={(e) => onChange({ ...userInfo, email: e.target.value })}
                    />
                </div>
                <div className="modal-field">
                    <label>Số điện thoại:</label>
                    <input
                        type="tel"
                        value={userInfo.phone}
                        onChange={(e) => onChange({ ...userInfo, phone: e.target.value })}
                    />
                </div>
                <div className="modal-actions">
                    <button className="modal-button" onClick={onSave}>
                        Lưu
                    </button>
                    <button className="modal-button cancel" onClick={onClose}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfoModal;