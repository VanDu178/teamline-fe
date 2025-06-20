import React, { useState } from "react";
import axiosInstance from "../../configs/axiosInstance";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { emailValidator, passwordValidator } from "../../utils/validation";
import { toast } from 'react-toastify';
import "../../styles/register.css";

const Register = () => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [errors, setErrors] = useState({});
    const [showResendLink, setShowResendLink] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
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
    };

    const setError = (field, message) => {
        setErrors(prev => ({
            ...prev,
            [field]: message
        }));
    };

    const clearError = (field) => {
        setErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleUnFocus = (e) => {
        const { name, value } = e.target;

        switch (name) {
            case "name":
                if (!value.trim()) {
                    setError("name", "Tên người dùng không được để trống");
                } else {
                    clearError("name");
                }
                break;

            case "email":
                if (!value.trim()) {
                    setError("email", "Email không được để trống");
                } else if (!emailValidator(value)) {
                    setError("email", "Email không hợp lệ");
                } else {
                    clearError("email");
                }
                break;

            case "password":
                const pwdError = passwordValidator(value);
                if (pwdError) {
                    setError("password", pwdError);
                } else {
                    clearError("password");
                }
                break;

            case "confirmPassword":
                if (!value.trim()) {
                    setError("confirmPassword", "Vui lòng xác nhận mật khẩu");
                } else if (value !== formData.password) {
                    setError("confirmPassword", "Mật khẩu xác nhận không khớp");
                } else {
                    clearError("confirmPassword");
                }
                break;

            default:
                break;
        }
    };

    const isFormInvalid =
        Object.keys(errors).length > 0 ||
        !formData.name.trim() ||
        !formData.email.trim() ||
        !formData.password.trim() ||
        !formData.confirmPassword.trim();

    const handleRegister = async (e) => {
        e.preventDefault();
        if (isProcessing || isFormInvalid) return;

        setIsProcessing(true);
        const { name, email, password } = formData;

        try {
            await axiosInstance.post("/auth/register", { name, email, password });
            toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản");
            setFormData({ name: "", email: "", password: "", confirmPassword: "" });
            setErrors({});
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng ký thất bại";
            if (err.response?.status === 403 && err.response?.data?.err_code === "ACCOUNT_NOT_ACTIVATED") {
                setShowResendLink(true);
                setError("general", "Tài khoản của bạn chưa được kích hoạt.");
            } else {
                setError("general", msg);
            }
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="register-page">
            <h1>Đăng ký</h1>
            <form>
                <div className="  input-wrapper">
                    <input
                        type="text"
                        name="name"
                        placeholder="Tên người dùng"
                        className="register-input"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleUnFocus}
                        disabled={isProcessing}
                    />
                    {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="  input-wrapper">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="register-input"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleUnFocus}
                        disabled={isProcessing}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className=" input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mật khẩu"
                        className="register-input password-input"
                        value={formData.password}
                        onChange={handleChange}
                        onBlur={handleUnFocus}
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
                    {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className=" input-wrapper">
                    <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        placeholder="Xác nhận mật khẩu"
                        className="register-input password-input"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        onBlur={handleUnFocus}
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
                    {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
                </div>

                <button
                    className="register-btn"
                    onClick={handleRegister}
                    disabled={isProcessing || isFormInvalid}
                >
                    {isProcessing ? "Đang xử lý..." : "Đăng ký"}
                </button>
            </form>

            {errors.general && <span className="error-message">{errors.general}</span>}

            {showResendLink && (
                <Link
                    to="/resend-link"
                    onClick={(e) => isProcessing && e.preventDefault()}
                    style={{
                        pointerEvents: isProcessing ? "none" : "auto",
                        opacity: isProcessing ? 0.5 : 1,
                        color: "blue"
                    }}
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
