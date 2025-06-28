import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/index";
import ChatList from "../../components/chat/ChatList/ChatList";
import ChatBox from "../../components/chatbox/ChatBox";
import { useAuth } from "../../contexts/AuthContext";
import { useChat } from "../../contexts/ChatContext";
import { useNotification } from "../../contexts/NotificationContext";
import { connectSocket, disconnectSocket, registerSocketEvents, setChatStore } from '../../utils/socket';
import { emitSocketEvent } from '../../configs/socketEmitter';
import { isLocalChatId } from '../../utils/chatIdUtils';

import 'bootstrap/dist/css/bootstrap.min.css';
import "./Main.css";

export let joinRoomFunction = null;

const Main = () => {
    const { isAuthenticated } = useAuth();
    const { setMessages, roomId, roomIdRef, setChats, chatsRef, setRoomId, isSearchingRef } = useChat();
    const { isNotificationOpenRef, setNotifications, notificationCountRef, setNotificationCount, notifications, notificationRef } = useNotification();
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
            setChatStore({ setMessages, roomIdRef, setChats, chatsRef, setRoomId, isSearchingRef, isNotificationOpenRef, setNotifications, notificationCountRef, setNotificationCount, notifications, notificationRef });
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
        <div className="container-fluid">
            <div className="row d-flex">
                <div className="bg-light p-0" style={{ width: '6%' }}>
                    <LeftSidebar />
                </div>
                <div className="bg-white p-0" style={{ width: '24%' }}>
                    <ChatList />
                </div>
                <div className="bg-secondary p-0" style={{ width: '70%' }}>
                    {showChat ? <ChatBox /> : <Outlet />}
                </div>
            </div>
        </div>
    );
};

export default Main;