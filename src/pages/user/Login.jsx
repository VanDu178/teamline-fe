import { Link } from "react-router-dom";
import "../../styles/login.css";

const Login = () => {
    const handleLogin = () => { }
    return (
        <div className="login-page">

            <h1>Đăng nhập</h1>
            <form >
                <input
                    type="email"
                    placeholder="Email"
                    className="login-input"
                    required
                />
                <input
                    type="password"
                    placeholder="Mật khẩu"
                    className="login-input"
                    required
                />
                <div className="forgot-password">
                    <Link to="/forgot-password">Quên mật khẩu?</Link>
                </div>
                <button type="submit" className="login-btn" onClick={handleLogin}>
                    Đăng nhập
                </button>
            </form>
            <p className="register-link">
                Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
            </p>
        </div>
    );
};


export default Login;