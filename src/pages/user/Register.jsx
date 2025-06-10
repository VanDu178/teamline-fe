import React, { useState } from "react";
import axiosInstance from "../../configs/axiosInstance";
import { Link } from "react-router-dom";
import { emailValidator, passwordValidator } from "../../helpers/validation";
import "../../styles/register.css";
const Register = () => {
    const [formData, setFormData] = useState({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [error, setError] = useState(null);

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

        // Kiểm tra xác nhận mật khẩu khi đang nhập
        if (name === "confirmPassword" && value && value !== formData.password) {
            setError("Mật khẩu xác nhận không khớp");
            return;
        }

        setError(null); // Không có lỗi
    };


    const handleRegister = async (e) => {
        e.preventDefault(); // Ngăn reload
        const { username, email, password } = formData;
        try {

            const res = await axiosInstance.post(
                "/auth/register",
                { username, email, password }
            );
            alert("Đăng ký thành công! Vui lòng kiểm tra email để xác minh.")
            setFormData({ username: "", email: "", password: "", confirmPassword: "" });
        } catch (err) {
            const msg = err.response?.data?.message || "Đăng ký thất bại";
            setError(msg);
        }
    };

    return (
        <div className="register-page">
            <h1>Đăng ký</h1>
            <form >
                <input
                    type="text"
                    name="username"
                    placeholder="Tên người dùng"
                    className="register-input"
                    required
                    value={formData.username}
                    onChange={handleChange}
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    className="register-input"
                    required
                    value={formData.email}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    className="register-input"
                    required
                    value={formData.password}
                    onChange={handleChange}
                />
                <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    className="register-input"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <button className="register-btn" onClick={handleRegister}>
                    Đăng ký
                </button>

            </form>
            {error && <p style={{ color: "red" }}>{error}</p>}

            <p className="login-link">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </div>
    );
};

export default Register;