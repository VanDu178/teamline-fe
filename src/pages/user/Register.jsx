import React from "react";
import { Link } from "react-router-dom";
import "../../styles/register.css";

const Register = () => {

    const handleRegister = () => {

    }
    return (
        <div className="register-page">
            <h1>Đăng ký</h1>
            <form>
                <input
                    type="email"
                    placeholder="Email"
                    className="register-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="register-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Xác nhận mật khẩu"
                    className="register-input"
                    required
                />
                <button type="submit" className="register-btn" onClick={handleRegister}>
                    Đăng ký
                </button>
            </form>
            <p className="login-link">
                Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
            </p>
        </div>
    );
};

export default Register;