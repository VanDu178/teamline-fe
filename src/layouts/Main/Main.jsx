import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
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
    const { isAuthenticated, userId, user } = useAuth();
    const { setMessages, roomId, roomIdRef } = useChat();
    const [showChat, setShowChat] = useState(false);


    // useEffect(() => {
    //     if (isAuthenticated && userId && user) {
    //         console.log("Kết nối socket khi đăng nhập thành công");
    //         connectSocket();
    //         setChatStore({ setMessages, roomIdRef });
    //     }
    //     return () => {
    //         disconnectSocket();
    //     };
    // }, [userId, isAuthenticated, user]);

    useEffect(() => {
        if (isAuthenticated) {
            console.log("Kết nối socket khi đăng nhập thành công");
            connectSocket();
            setChatStore({ setMessages, roomIdRef }); // set store và tự động register luôn ở đây
        }
        return () => {
            disconnectSocket();
        };
    }, []);


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