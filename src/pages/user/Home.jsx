import React, { useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import "../../styles/home.css"
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { isDarkMode, toggleTheme } = useTheme();
    const { logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    return (
        isAuthenticated && (
            <div className="main">
                <button onClick={toggleTheme} className="theme-toggle">
                    {isDarkMode === "dark" ? "Chuyển sang Light Mode" : "Chuyển sang Dark Mode"}
                </button>
                {isAuthenticated ? (
                    <button onClick={logout}>
                        Logout
                    </button>
                ) : (
                    <button onClick={() => navigate('/login')}>
                        Login
                    </button>
                )}

                <h1 className="title">
                    Chào mừng đến với <span className="highlight">Zalo PC</span>!
                </h1>
                <p className="description">
                    Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè được tối ưu hóa cho máy tính của bạn.
                </p>
                <div className="info-card">
                    <div className="upgrade-button">NÂNG CẤP NGAY</div>
                    <ul className="feature-list">
                        <li>• Tin nhắn tự động</li>
                        <li>• Nhận diện điện Business</li>
                        <li>• Mở rộng danh bạ</li>
                        <li>• Mở rộng nhóm</li>
                    </ul>
                </div>
                <div className="business-info">
                    <div className="highlight">Kinh doanh hiệu quả với zBusiness Pro</div>
                    <p className="business-description">
                        Bán hàng chuyên nghiệp với <span className="business-text">Nhãn Business</span> và <span className="business-text">Bộ công cụ kinh doanh</span>, mở khóa tiềm năng tiếp cận khách hàng trên Zalo
                    </p>
                    <button className="learn-more-btn">Tìm hiểu thêm</button>
                </div>
            </div>
        )

    );

};

export default Home;