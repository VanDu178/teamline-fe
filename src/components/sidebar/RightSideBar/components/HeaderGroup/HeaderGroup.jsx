import imgGroupDefault from "../../../../../assets/images/img-group-default.jpg";
import imgUserDefault from "../../../../../assets/images/img-user-default.jpg";
import { IoIosNotifications } from "react-icons/io";
import { TiPin } from "react-icons/ti";
import { MdGroupAdd } from "react-icons/md";

const HeaderGroup = () => (
    <div className="rs-group-header">
        <h2 className="rs-sidebar-title">Thông tin hội thoại</h2>
        {/* <h2 className="rs-sidebar-title">Thông tin nhóm</h2> */}
        <div className="rs-user-info">
            <img src="#" alt="User avatar" className="rs-user-avatar" />
            <div className="rs-user-details">
                <div className="rs-user-name">Đặng Trung Lor</div>
            </div>
        </div>
        <div className="rs-sidebar-actions">
            <button className="rs-action-btn" title="Tắt thông báo"><IoIosNotifications className="rs-action-btn-icon" /></button>
            <button className="rs-action-btn" title="Ghim hội thoại"><TiPin className="rs-action-btn-icon" /></button>
            <button className="rs-action-btn" title="Tạo nhóm trò chuyện"> <MdGroupAdd className="rs-action-btn-icon" /></button>
        </div>
    </div>
);

export default HeaderGroup;