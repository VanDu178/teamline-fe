import React, { useState } from "react";
import axiosInstance from "../../configs/axiosInstance";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { emailValidator, passwordValidator } from "../../helpers/validation";
import { toast } from 'react-toastify';
import "../../styles/register.css";

const Register = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState(null);
    const [showResendLink, setShowResendLink] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false); // Thêm state cho confirm password
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        if (name === "email" && value && !emailValidator(value)) {
            setError("Email không hợp lệ");
            return;
        }

        if (name === "password" && value) {
            const passwordErrors = passwordValidator(value);
            if (passwordErrors) {
                setError(passwordErrors);
                return;
            }
        }

        if (name === "confirmPassword" && value && value !== formData.password) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setError(null);
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (isProcessing) return;
        setIsProcessing(true);
        const { username, email, password } = formData;
        try {
            await axiosInstance.post(
                "/auth/register",
                { username, email, password }
            );
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản");
            setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng ký thất bại";
            if (err.response?.status === 403 && err.response?.data?.err_code === "ACCOUNT_NOT_ACTIVATED") {
                setShowResendLink(true);
                setError("Tài khoản của bạn chưa được kích hoạt.");
            } else {
                setError(msg);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="register-page">
            <h1>Đăng ký</h1>
            <form>
                <input
                    type="text"
                    name="username"
                    placeholder="Tên người dùng"
                    className="register-input"
                    required
                    value={formData.username}
                    onChange={handleChange}
                    disabled={isProcessing}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="register-input"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    disabled={isProcessing}
                />
                <div className="input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mật khẩu"
                        className="register-input password-input"
                        required
                        value={formData.password}
                        onChange={handleChange}
                        disabled={isProcessing}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                        disabled={isProcessing}
                    >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <div className="input-wrapper">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu"
                        className="register-input password-input"
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        disabled={isProcessing}
                    />
                    <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isProcessing}
                    >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>
                <button className="register-btn" onClick={handleRegister} disabled={isProcessing}>
                    {isProcessing ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}
            {showResendLink && (
                <Link
                    to="/resend-link"
                    onClick={(e) => isProcessing && e.preventDefault()}
                    style={{ pointerEvents: isProcessing ? "none" : "auto", opacity: isProcessing ? 0.5 : 1, color: "blue" }}
                >
                    Nhấn vào đây để gửi lại liên kết kích hoạt
                </Link>
            )}
            <p className="login-link">
                Đã có tài khoản?
                <Link
                    to="/login"
                    onClick={(e) => isProcessing && e.preventDefault()}
                    style={{
                        pointerEvents: isProcessing ? "none" : "auto",
                        opacity: isProcessing ? 0.5 : 1,
                    }}
                >
                    Đăng nhập ngay
                </Link>
            </p>
        </div>
    );
};

export default Register;