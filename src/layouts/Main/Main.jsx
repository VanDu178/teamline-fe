import { use, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/LeftSideBar";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar";
import ChatBox from "../../components/chatbox/ChatBox";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';

import "./Main.css";

const Main = () => {
    const { isAuthenticated, userId } = useAuth();
    const { setMessages, roomId, roomIdRef } = useChat();
    const [showChat, setShowChat] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isAuthenticated) {
            alert("Phien dang nhap da het han")
            navigate('/login', { replace: true });
        }
        if (isAuthenticated) {
            console.log("Kết nối socket khi đăng nhập thành công");
            const newSocket = connectSocket(); // connect trước
            setChatStore({ setMessages, roomIdRef }); // set store và tự động register luôn ở đây
        }
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        if (roomId) {
            setShowChat(true);
            emitSocketEvent('join-room', { roomId }); // Tham gia phòng chat khi component mount
        }
        // Lưu trữ context chat vào socket để có thể sử dụng trong các sự kiện socket
    }, [roomId]);

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
            {showChat ? <ChatBox /> : <Outlet />}
            <RightSideBar />
        </div>
    );
};

export default Main;