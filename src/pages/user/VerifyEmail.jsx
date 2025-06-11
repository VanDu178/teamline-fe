import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import axiosInstance from "../../configs/axiosInstance";
import "../../styles/verify-email.css";

const VerifyEmail = () => {
    const [message, setMessage] = useState("Verifying your email...");
    const [isSuccess, setIsSuccess] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const [timer, setTimer] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get("token");

                if (!token) {
                    setMessage("Invalid verification link");
                    return;
                }

                const response = await axiosInstance.get(`/auth/verify-email?token=${token}`);
                if (response.status === 200) {
                    setMessage(response.data.message || "Email verified successfully");
                    setIsSuccess(true);

                    // Bắt đầu đếm ngược
                    const interval = setInterval(() => {
                        setCountdown((prev) => {
                            if (prev <= 1) {
                                clearInterval(interval);
                                window.location.href = "/login";
                                return 0;
                            }
                            return prev - 1;
                        });
                    }, 1000);

                    const timeout = setTimeout(() => {
                        clearInterval(interval);
                        window.location.href = "/login";
                    }, 5000);

                    setTimer({ interval, timeout }); // Lưu timer
                    return () => {
                        clearInterval(interval);
                        clearTimeout(timeout);
                    };
                }
            } catch (error) {
                setMessage(error.response?.data?.message || "Verification failed");
                setIsSuccess(false);
            }
        };

        verifyEmail();
    }, [location]);

    const handleBackToLogin = () => {
        if (timer) {
            clearInterval(timer.interval);
            clearTimeout(timer.timeout);
        }
        window.location.href = "/login";
    };

    return (
        <div className="verify-container">
            <div className="verify-card">
                <h2 className="verify-title">Xác thực email</h2>
                <div className="verify-icon">
                    {isSuccess ? (
                        <span role="img" aria-label="success">✅</span>
                    ) : (
                        <span role="img" aria-label="fail">❌</span>
                    )}
                </div>
                <p className="verify-message">
                    {isSuccess ? message : (
                        <>
                            <span>{message}</span>
                            <br />
                            <Link to="/resend-link">Nhấn vào đây để gửi lại liên kết kích hoạt</Link>
                        </>
                    )}
                </p>
                {isSuccess && (
                    <p className="verify-redirect">
                        Redirecting to login in <span id="countdown">{countdown}</span> seconds...
                        <br />
                        <Link to="/login" className="back-link" onClick={handleBackToLogin}>
                            Quay lại đăng nhập
                        </Link>
                    </p>
                )}
            </div>
        </div >
    );
};

export default VerifyEmail;