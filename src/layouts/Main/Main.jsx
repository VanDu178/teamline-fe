import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/LeftSideBar";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar";
import SkeletonLayout from "../SkeletonLayout/Skeleton";
import { useAuth } from "../../contexts/AuthContext";
import "./Main.css";

const Main = () => {
    const { isAuthenticated, isCheckingLogin } = useAuth();
    const navigate = useNavigate();
    useEffect(() => {
        if (!isAuthenticated) {
            alert("Phien dang nhap da het han")
            navigate('/login', { replace: true });
        }
    }, [isAuthenticated]);

    if (isCheckingLogin) {
        return <SkeletonLayout />
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