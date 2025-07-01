import { FaClock } from "react-icons/fa";
import { MdGroupAdd } from "react-icons/md";

const RemindersGroup = () => (
    <div className="rs-group-reminders">
        <div className="rs-section">
            <span className="rs-section-icon"><FaClock /></span> Danh sách nhắn hen
        </div>
        <div className="rs-section">
            <span className="rs-section-icon"> <MdGroupAdd /></span> 16 nhóm chung
        </div>
    </div>
);

export default RemindersGroup;