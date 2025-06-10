import { Outlet } from "react-router-dom";
import LeftSidebar from "../../components/sidebar/LeftSideBar/LeftSideBar";
import ChatList from "../../components/chat/ChatList/ChatList";
import RightSideBar from "../../components/sidebar/RightSideBar/RightSideBar"
import Chat from "../../pages/user/Chat"


import "./Main.css"

const Main = () => (
    <div className="flex-container">
        <LeftSidebar />
        <ChatList />
        <Chat />
        <RightSideBar />
    </div>
);

export default Main;