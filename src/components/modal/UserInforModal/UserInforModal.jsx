import { useState, useEffect, useMemo } from "react";
import imgUserDefault from "../../../assets/images/img-user-default.jpg";
import axiosInstance from "../../../configs/axiosInstance";
import { toast } from 'react-toastify';
import Cookies from "js-cookie";
import { useAuth } from "../../../contexts/AuthContext";
import "./UserInforModal.css";

const UserInfor = ({ isOpen, setIsUserInfoModalOpen }) => {
    const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);
    const [errors, setErrors] = useState({});
    const [isProcessing, setIsProcessing] = useState(false);
    const { user, setUser } = useAuth();
    const [editedInfo, setEditedInfo] = useState({ ...user });


    const handleSaveChanges = async () => {
        try {
            if (isProcessing) return;
            setIsProcessing(true)
            const formData = new FormData();
            formData.append("name", editedInfo.name);
            // Nếu là File, gửi lên
            if (editedInfo.avatar instanceof File) {
                formData.append("avatar", editedInfo.avatar);
            }
            // Nếu người dùng đã xoá avatar (rỗng chuỗi), báo backend
            if (editedInfo.avatar === "") {
                formData.append("removeAvatar", "true");
            }
            // Gửi formData bằng Axios
            const response = await axiosInstance.put(`/users/${user._id}`, formData);
            const updatedUser = response.data?.user;
            setUser(updatedUser);
            setIsUserInfoModalOpen(false);
            toast.success("Cập nhật thông tin thành công");
            Cookies.set("user", JSON.stringify(updatedUser), { expires: 365 });
        } catch (error) {
            console.error("Lỗi cập nhật:", error);
        }
        finally {
            setIsProcessing(false)
        }
    };



    const handleCancel = () => {
        setIsUserInfoModalOpen(false);
        setErrors(false)
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        const updated = { ...editedInfo, [name]: value.trimStart() };
        setEditedInfo(updated);

        if (name === "name") {
            if (!value.trim()) {
                setErrors((prev) => ({ ...prev, name: "Tên không được để trống" }));
            } else {
                setErrors((prev) => {
                    const newErrors = { ...prev };
                    delete newErrors.name;
                    return newErrors;
                });
            }
        }
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setEditedInfo((prev) => ({
            ...prev,
            avatar: file,
        }));
    };

    const handleDeleteImage = () => {
        setEditedInfo((prev) => ({
            ...prev,
            avatar: "",
        }));
    };

    useEffect(() => {
        if (editedInfo.avatar instanceof File) {
            const objectUrl = URL.createObjectURL(editedInfo.avatar);
            setAvatarObjectUrl(objectUrl);
            return () => URL.revokeObjectURL(objectUrl);
        } else {
            setAvatarObjectUrl(null);
        }
    }, [editedInfo.avatar]);

    const previewUrl = editedInfo.avatar instanceof File
        ? avatarObjectUrl
        : typeof editedInfo.avatar === "string" && editedInfo.avatar !== ""
            ? editedInfo.avatar
            : imgUserDefault;


    const isSaveDisabled = isProcessing || !!errors.name || !editedInfo.name?.trim();

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={handleCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Thông tin cá nhân</h2>
                    <button className="modal-close" onClick={handleCancel}>
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
                            {editedInfo.avatar && (
                                <button
                                    className="avatar-delete-button"
                                    onClick={handleDeleteImage}
                                    title="Xóa ảnh"
                                    disabled={isProcessing}
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
                                disabled={isProcessing}
                            />
                        </label>
                    </div>

                    <div className="modal-field">
                        <label>Tên:</label>
                        <input
                            name="name"
                            type="text"
                            value={editedInfo.name || ""}
                            onChange={handleChange}
                            disabled={isProcessing}
                        />
                        <span className="error-message">{errors.name || " "}</span>
                    </div>

                    <div className="modal-field">
                        <label>Email:</label>
                        <input
                            name="email"
                            type="email"
                            value={editedInfo.email || ""}
                            readOnly
                            disabled
                        />
                    </div>
                </div>

                <div className="modal-actions">
                    <button
                        className="modal-button save"
                        onClick={() => { handleSaveChanges(editedInfo) }}
                        disabled={isSaveDisabled}
                    >
                        {isProcessing ? "Đang lưu..." : "Lưu"}
                    </button>

                    <button
                        className="modal-button cancel"
                        onClick={handleCancel}
                        disabled={isProcessing}
                    >
                        Hủy
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserInfor;
