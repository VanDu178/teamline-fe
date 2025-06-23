import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/index";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar";
import ChatBox from "../../components/chatbox/ChatBox";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { isLocalChatId } from '../../utils/chatIdUtils';

import "./Main.css";

export let joinRoomFunction = null;

const Main = () => {
    const { isAuthenticated } = useAuth();
    const { setMessages, roomId, roomIdRef, setChats, chatsRef, setRoomId, isSearchingRef, isNotificationOpenRef, setNotifications, notificationCountRef, setNotificationCount } = useChat();
    const [showChat, setShowChat] = useState(false);

    const joinRoom = () => {
        if (!isLocalChatId(roomId) && roomId) {
            emitSocketEvent('join-room', { roomId });
            return true;
        } else {
            return false;
        }
    };
    // Gán function vào biến toàn cục để file khác có thể import
    joinRoomFunction = joinRoom;

    useEffect(() => {
        if (isAuthenticated) {
            connectSocket();
            setChatStore({ setMessages, roomIdRef, setChats, chatsRef, setRoomId, isSearchingRef, isNotificationOpenRef, setNotifications, notificationCountRef, setNotificationCount });
            // set store và tự động register luôn ở đây
        }
        return () => {
            disconnectSocket();
        };
    }, [isAuthenticated]);

    useEffect(() => {
        //Nếu là localChatId thì điều đó có nghĩa đang click vào một cuộc  hội thoại mới
        if (isLocalChatId(roomId)) {
            setMessages([]);
            setShowChat(true);
        } else if (roomId) {
            setShowChat(true);
            joinRoom();
            // emitSocketEvent('join-room', { roomId });
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