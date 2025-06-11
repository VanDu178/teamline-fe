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
            alert("Phien dang nhap da het han")
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated]);


    // useEffect(() => {
    //     if (!isCheckingLogin && !isAuthenticated) {
    //         console.log("Chuyển hướng về login do chưa xác thực");
    //         navigate('/login', { replace: true });
    //     }
    // }, [isAuthenticated, isCheckingLogin, navigate]);


    // if (isCheckingLogin) {
    //     return <div>Loading...</div>; // Hoặc spinner đẹp hơn
    // }
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