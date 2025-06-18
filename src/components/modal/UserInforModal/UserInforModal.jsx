import { useState, useEffect, useMemo } from "react";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import "./UserInforModal.css";

const UserInfor = ({
    isOpen,
    onClose,
    onSave,
    onChange,
    editedInfo,
    setEditedInfo,
    isEditable = false,
}) => {
    const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...editedInfo, [name]: value };
        setEditedInfo(updated);
        onChange?.(updated);
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return; // 👈 Người dùng không chọn file, bỏ qua

        setEditedInfo((prev) => ({
            ...prev,
            avatar: file,
        }));
        onChange?.({
            ...editedInfo,
            avatar: file,
        });
    };

    const handleDeleteImage = () => {
        setEditedInfo((prev) => ({
            ...prev,
            avatar: "",
        }));
        onChange?.({
            ...editedInfo,
            avatar: "",
        });
    };

    // Preview ảnh đúng cách + cleanup object URL
    const previewUrl = useMemo(() => {
        if (editedInfo.avatar instanceof File) {
            const objectUrl = URL.createObjectURL(editedInfo.avatar);
            setAvatarObjectUrl(objectUrl);
            return objectUrl;
        }
        return typeof editedInfo.avatar === "string" && editedInfo.avatar !== ""
            ? editedInfo.avatar
            : imgUserDefault;
    }, [editedInfo.avatar]);

    useEffect(() => {
        return () => {
            if (avatarObjectUrl) {
                URL.revokeObjectURL(avatarObjectUrl);
            }
        };
    }, [avatarObjectUrl]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Thông tin cá nhân</h2>
                    <button className="modal-close" onClick={onClose}>
                        &times;
                    </button>
                </div>

                <div className="modal-body">
                    <div className="avatar-preview">
                        <div className="avatar-container">
                            <img
                                src={previewUrl}
                                alt="Avatar"
                                className="avatar-image"
                                onError={(e) => (e.target.src = imgUserDefault)}
                            />
                            {editedInfo.avatar && isEditable && (
                                <button
                                    className="avatar-delete-button"
                                    onClick={handleDeleteImage}
                                    title="Xóa ảnh"
                                >
                                    ✖
                                </button>
                            )}
                        </div>

                        <label htmlFor="avatar-upload" className="avatar-upload-label">
                            Thay đổi ảnh
                            <input
                                id="avatar-upload"
                                type="file"
                                accept="image/*"
                                style={{ display: "none" }}
                                onChange={handleImageChange}
                                disabled={!isEditable}
                            />
                        </label>
                    </div>

                    <div className="modal-field">
                        <label>Tên:</label>
                        <input
                            name="name"
                            type="text"
                            value={editedInfo.name}
                            onChange={handleChange}
                            disabled={!isEditable}
                        />
                    </div>

                    <div className="modal-field">
                        <label>Email:</label>
                        <input
                            name="email"
                            type="email"
                            value={editedInfo.email}
                            readOnly
                            disabled
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="modal-button save"
                        onClick={() => onSave(editedInfo)}
                        disabled={!isEditable}
                    >
                        Lưu
                    </button>

                    <button className="modal-button cancel" onClick={onClose} disabled={!isEditable}>
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfor;
