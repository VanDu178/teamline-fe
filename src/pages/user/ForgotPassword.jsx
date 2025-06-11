import { useState } from "react";
import { Link } from "react-router-dom";
import { emailValidator } from "../../helpers/validation";
import axiosInstance from "../../configs/axiosInstance";
import { toast } from 'react-toastify';
import "../../styles/forgot-password.css"

const ForgotPasswordForm = () => {
    const [email, setEmail] = useState("");
    const [error, setError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const handleChange = (e) => {
        const value = e.target.value;
        setEmail(value);
        // Kiểm tra lỗi ngay khi người dùng nhập email
        if (value && !emailValidator(value)) {
            setError("Email không hợp lệ");
            return;
        }
        setError(null);
    }

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);
        try {

            await axiosInstance.post(
                "/auth/forgot-password",
                { email }
            );
            toast.success("Mật khẩu mới đã được gửi về email của bạn");
            setEmail("");
        } catch (err) {
            const msg = err.response?.data?.message || "Khôi phục mật khẩu thất bại";
            setError(msg);
        }
        finally {
            setIsProcessing(false)
        }
    };

    return (
        <div className="forgot-password-container">
            <div className="form-wrapper">
                <h2 className="title">Quên mật khẩu?</h2>
                <p className="subtitle">
                    Điền email gắn với tài khoản để nhận hướng dẫn <br />đặt lại mật khẩu
                </p>
                <form className="form">
                    <div className="input-group">
                        <label className="label">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={handleChange}
                            className="input"
                            disabled={isProcessing}
                            required
                        />
                    </div>
                    <button type="submit" className="submit-button" onClick={handleResetPassword} disabled={isProcessing}>
                        {isProcessing ? "Đang xử lý..." : "Tiếp tục"}
                    </button>
                </form>
                {error && <p style={{ color: "red" }}>{error}</p>}
                <p className="back-link">
                    Đã có tài khoản?
                    <Link
                        to="/login"
                        onClick={(e) => isProcessing && e.preventDefault()}
                        style={{
                            pointerEvents: isProcessing ? "none" : "auto",
                            opacity: isProcessing ? 0.5 : 1,
                        }}
                    >
                        Quay lại đăng nhập
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordForm;