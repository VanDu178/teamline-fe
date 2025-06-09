import { Link, useNavigate } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";
import { emailValidator, passwordValidator } from "../../helpers/validation";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/login.css";
import { useEffect, useState } from "react";

const Login = () => {
    const navigate = useNavigate();
    const { isAuthenticated, loggedIn } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        password: ""
    })
    const [error, setError] = useState(null)

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

        // Kiểm tra lỗi ngay khi người dùng nhập email
        if (name === "email" && value && !emailValidator(value)) {
            setError("Email không hợp lệ");
            return;
        }

        // Kiểm tra lỗi mật khẩu khi đang nhập
        if (name === "password" && value) {
            const passwordErrors = passwordValidator(value);
            if (passwordErrors) {
                setError(passwordErrors);
                return;
            }
        }
        setError(null); // Không có lỗi
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

            // accessToken sẽ được lưu ở cookie httpOnly từ backend
            alert("Đăng nhập thành công");
            loggedIn(res.data?.existingUser);
            navigate("/");
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng nhập thất bại";
            setError(msg);
        }
        finally {
            setIsProcessing(false);
        }
    }
    return (
        <div className="login-page">

            <h1>Đăng nhập</h1>
            <form >
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
                <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    className="login-input"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isProcessing}
                />
                <div className="forgot-password">
                    <Link
                        to="/forgot-password"
                        onClick={e => isProcessing && e.preventDefault()} // disable navigation
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