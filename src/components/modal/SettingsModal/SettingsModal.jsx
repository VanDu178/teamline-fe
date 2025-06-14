import "./SettingsModal.css"

const SettingsModal = ({ isOpen, onClose, theme, setTheme }) => {
    if (!isOpen) return null;

    const handleThemeChange = (selectedTheme) => {
        setTheme(selectedTheme);
    };

    return (
        <div className="settings-modal-overlay" onClick={onClose}>
            <div className="settings-modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="settings-modal-header">
                    <h2>Cài đặt</h2>
                    <button className="settings-modal-close" onClick={onClose}>
                        ×
                    </button>
                </div>
                <div className="settings-modal-body">
                    <div className="settings-menu">
                        <ul>
                            <li>Cài đặt chung</li>
                            <li>Quyền riêng tư</li>
                            <li className="active">Giao diện <span>Beta</span></li>
                            <li>Thông báo</li>
                            <li>Tin nhắn</li>
                            <li>Tiện ích</li>
                        </ul>
                    </div>
                    <div className="settings-content">
                        <div className="settings-section">
                            <h3>Cài đặt giao diện</h3>
                            <div className="theme-options">
                                <label>
                                    <input
                                        type="radio"
                                        name="theme"
                                        checked={theme === "Sáng"}
                                        onChange={() => handleThemeChange("Sáng")}
                                    />
                                    Sáng
                                </label>
                                <label>
                                    <input
                                        type="radio"
                                        name="theme"
                                        checked={theme === "Tối"}
                                        onChange={() => handleThemeChange("Tối")}
                                    />
                                    Tối
                                </label>

                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsModal;