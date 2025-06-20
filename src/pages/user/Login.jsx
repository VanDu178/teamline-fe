import { useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";
import { emailValidator, passwordValidator } from "../../utils/validation";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/login.css";

const Login = () => {
    const navigate = useNavigate();
    const { loggedIn } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showResendLink, setShowResendLink] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });

    const [errors, setErrors] = useState({});

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

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));

        // Validate on change
        if (name === "email") {
            if (!emailValidator(value)) {
                setError("email", "Email không hợp lệ");
            } else {
                clearError("email");
            }
        }

        if (name === "password") {
            const passwordError = passwordValidator(value);
            if (passwordError) {
                setError("password", passwordError);
            } else {
                clearError("password");
            }
        }

        clearError("general"); // reset general errors when typing
    };

    const isFormInvalid =
        Object.keys(errors).length > 0 ||
        !formData.email.trim() ||
        !formData.password.trim();

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isProcessing || isFormInvalid) return;
        setIsProcessing(true);
        const { email, password } = formData;

        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password,
            });
            navigate("/", { replace: true });
            loggedIn(res.data?.existingUser);
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
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
        <div className="login-page">
            <h1>Đăng nhập</h1>
            <form>
                <div className="input-wrapper">
                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        className="login-input"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        disabled={isProcessing}
                    />
                    <span className="error-message">{errors.email || " "}</span>
                </div>

                <div className="input-wrapper">
                    <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        placeholder="Mật khẩu"
                        className="login-input password-input"
                        value={formData.password}
                        onChange={handleChange}
                        required
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
                    <span className="error-message">{errors.password || " "}</span>
                </div>

                <div className="forgot-password">
                    <Link
                        to="/forgot-password"
                        onClick={e => isProcessing && e.preventDefault()}
                        style={{ pointerEvents: isProcessing ? "none" : "auto", opacity: isProcessing ? 0.5 : 1 }}
                    >
                        Quên mật khẩu?
                    </Link>
                </div>

                <button className="login-btn" onClick={handleLogin} disabled={isProcessing || isFormInvalid}>
                    {isProcessing ? "Đang xử lý..." : "Đăng nhập"}
                </button>
            </form>

            <span className="error-message">{errors.general || " "}</span>

            {showResendLink && (
                <Link
                    to="/resend-link"
                    onClick={(e) => isProcessing && e.preventDefault()}
                    style={{ pointerEvents: isProcessing ? "none" : "auto", opacity: isProcessing ? 0.5 : 1, color: "blue" }}
                >
                    Nhấn vào đây để gửi lại liên kết kích hoạt
                </Link>
            )}

            <p className="register-link">
                Bạn chưa có tài khoản?{" "}
                <Link
                    to="/register"
                    onClick={(e) => isProcessing && e.preventDefault()}
                    style={{
                        pointerEvents: isProcessing ? "none" : "auto",
                        opacity: isProcessing ? 0.5 : 1,
                    }}
                >
                    Đăng ký ngay
                </Link>
            </p>
        </div>
    );
};

export default Login;
