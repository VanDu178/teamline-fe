import NotificationItem from "../NotificationItem/NotificationItem";
// import "./NotificationSidebar.css"

const NotificationSidebar = ({ notifications, cursor, isLoading, loadMoreRef, handleDeleteNotification }) => {
    return (
        <div className="notif-sidebar">
            <div className="notif-header"><h3>Thông báo</h3></div>
            <div className="notif-body">
                {notifications.length > 0 ? (
                    <ul className="notif-list">
                        {notifications.map((notif) => (
                            <NotificationItem
                                key={notif._id}
                                notification={notif}
                                onDelete={handleDeleteNotification}
                            />
                        ))}
                        {cursor && (
                            <li ref={loadMoreRef} className="notif-load-more">
                                {isLoading ? "Đang tải…" : "Scroll để tải thêm"}
                            </li>
                        )}
                    </ul>
                ) : (
                    <p className="notif-empty">Không có thông báo nào.</p>
                )}
            </div>
        </div>
    );
};

export default NotificationSidebar;
