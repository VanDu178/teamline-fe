import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/LeftSideBar";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar";
import { useAuth } from "../../contexts/AuthContext";

import "./Main.css";

const Main = () => {
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login', { replace: true }); // Thêm replace để không cho phép quay lại
        }
    }, [isAuthenticated, navigate]);

    if (!isAuthenticated) {
        return null; // Tránh render nội dung khi chưa được xác thực
    }

    return (
        <div className="flex-container">
            <LeftSidebar />
            <ChatList />
            <Outlet />
            <RightSideBar />
        </div>
    );
};

export default Main;
