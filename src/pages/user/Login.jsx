import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";
import { emailValidator, passwordValidator } from "../../helpers/validation";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/login.css";
import { useEffect, useState } from "react";
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loggedIn } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    });
    const [error, setError] = useState(null);
    const [showResendLink, setShowResendLink] = useState(false);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/");
        }
    }, [isAuthenticated, navigate]);

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
        setError(null);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isProcessing) return;
        setIsProcessing(true);
        const { email, password } = formData;

        try {
            const res = await axiosInstance.post("/auth/login", {
                email,
                password,
            });
            loggedIn(res.data?.existingUser);
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
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
        <div className="login-page">
            <h1>Đăng nhập</h1>
            <form>
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
                <button className="login-btn" onClick={handleLogin} disabled={isProcessing}>
                    {isProcessing ? "Đang xử lý..." : "Đăng nhập"}
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