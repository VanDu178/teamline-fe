import imgUserDefault from "../../../../../assets/images/img-user-default.jpg";

const AvatarMenu = ({
    user,
    isAvataOpen,
    activeIcon,
    handleAvatarClick,
    handleOpenUserInfoModal,
    handleOpenSettingModal,
    logout,
}) => {
    return (
        <div className="avatar-container">
            <img
                src={user?.avatar || imgUserDefault}
                alt="avatar"
                className={`avatar ${activeIcon === "avatar" ? "active" : ""}`}
                onClick={handleAvatarClick}
                onError={(e) => (e.target.src = imgUserDefault)}
            />
            {isAvataOpen && (
                <div className="avatar-box">
                    <ul className="avatar-list">
                        <li className="avatar-item" onClick={handleOpenUserInfoModal}>Xem thông tin</li>
                        <li className="avatar-item" onClick={logout}>Đăng xuất</li>
                        <li className="avatar-item" onClick={handleOpenSettingModal}>Cài đặt</li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default AvatarMenu;
