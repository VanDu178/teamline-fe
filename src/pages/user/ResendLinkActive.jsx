import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";
import { emailValidator } from "../../utils/validation";
import { toast } from 'react-toastify';
import "../../styles/resend-link-active.css"

const ResendLinkActive = () => {
    const [email, setEmail] = useState("");
    const [isProcessing, setIsProcessing] = useState(false)
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);

        // Kiểm tra lỗi ngay khi người dùng nhập email
        if (value && !emailValidator(value)) {
            setError("Email không hợp lệ");
            return;
        }
        setError(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);

        try {
            await axiosInstance.post("/auth/resend-verify", { email });
            toast.success("Link kích hoạt đã được gửi lại email thành công");
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
            setError(msg);
        }

        finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="resend-link-container">
            <div className="form-wrapper">
                <h2 className="title">Gửi lại liên kết kích hoạt</h2>
                <p className="subtitle">
                    Điền email để nhận lại liên kết kích hoạt tài khoản của bạn
                </p>
                <form onSubmit={handleSubmit} className="form">
                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={handleChange}
                            className="input"
                            required
                            disabled={isProcessing}
                        />
                    </div>
                    <button type="submit" className="submit-button" disabled={isProcessing}>Gửi lại</button>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p className="back-link">

                    <Link
                        to="/login"
                        onClick={(e) => isProcessing && e.preventDefault()}
                        style={{
                            pointerEvents: isProcessing ? "none" : "auto",
                            opacity: isProcessing ? 0.5 : 1,
                        }}
                    >
                        Quay lại trang đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ResendLinkActive;