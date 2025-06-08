import React from "react";
import "./LeftSideBar.css"

const Sidebar = () => (
    <div className="leftsidebar">
        <img
            src="https://plus.unsplash.com/premium_photo-1664474619075-644dd191935f?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aW1hZ2V8ZW58MHx8MHx8fDA%3D"
            alt="avatar"
            className="avatar"
        />
        <span className="icon">💬</span>
        <span className="icon">👥</span>
        <span className="icon">☁️</span>
        <span className="icon">🔒</span>
        <span className="icon settings">⚙️</span>
    </div>
);

export default Sidebar;