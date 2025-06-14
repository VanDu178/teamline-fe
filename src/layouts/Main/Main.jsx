import { use, useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/LeftSideBar";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar";
import SkeletonLayout from "../SkeletonLayout/Skeleton";
import ChatBox from "../../components/chatbox/ChatBox";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';

import "./Main.css";

const Main = () => {
    const { isAuthenticated, userId, user } = useAuth();
    const { setMessages, roomId, roomIdRef } = useChat();
    const [showChat, setShowChat] = useState(false);


    useEffect(() => {
        if (isAuthenticated && userId && user) {
            console.log("Kết nối socket khi đăng nhập thành công");
            const newSocket = connectSocket();
            setChatStore({ setMessages, roomIdRef });
        }
        return () => {
            disconnectSocket();
        };
    }, [userId, isAuthenticated, user]);


    useEffect(() => {
        if (roomId) {
            setShowChat(true);
            emitSocketEvent('join-room', { roomId });
        }
    }, [roomId]);


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