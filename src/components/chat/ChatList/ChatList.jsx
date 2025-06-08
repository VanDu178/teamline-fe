import React from "react";
import ChatItem from "../ChatItem/ChatItem";
import './ChatList.css';

const ChatList = () => (
    <div className="chatlist">
        <div className="chatlist-search">
            <input
                placeholder="Tìm kiếm"
                className="search-input"
            />
        </div>
        <div className="chatlist-content">
            {[
                { name: "Nguyễn Hoài Niệm", time: "20 giờ", message: "The RightSidebar is added as the fourth child", avatar: "https://www.shutterstock.com/image-photo/man-taking-photo-camera-on-260nw-2128177547.jpg" },
                { name: "Nguyễn Anh Hoài Phong Tín Chấp", time: "Hôm qua", message: "The existing flex-container in Main.css will distribute the space among all four components.", avatar: "https://www.shutterstock.com/image-photo/man-taking-photo-camera-on-260nw-2128177547.jpg" },
                { name: "Trường Làng Sơn Ca Đông Hà", time: "2 ngày", message: "The RightSidebar is added as the fourth child in the flex-container, taking up approximately 25% of the screen width. Adjust the width in .right-sidebar if needed to balance with other sections ", avatar: "https://www.shutterstock.com/image-photo/man-taking-photo-camera-on-260nw-2128177547.jpg" },
                { name: "Phạm Nguyễn Trường Sơn Và Dãy Bạch Mã", time: "2 ngày", message: "The RightSidebar is added as the fourth child in the flex-container, taking up approximately 25% of the screen width. Adjust the width in .right-sidebar if needed to balance with other sections", avatar: "https://www.shutterstock.com/image-photo/man-taking-photo-camera-on-260nw-2128177547.jpg" },
            ].map((chat, idx) => (
                <ChatItem key={idx} name={chat.name} time={chat.time} message={chat.message} avatar={chat.avatar} />
            ))}
        </div>
    </div>
);

export default ChatList;