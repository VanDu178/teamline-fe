import "./Skeleton.css";

const SkeletonLayout = () => {
    return (
        <div className="skeleton-layout">
            <div className="skeleton-header">
                <span className="skeleton-logo">Zalo</span>
                <span className="skeleton-loading">Đang tải...</span>
            </div>
        </div>
    );
};

export default SkeletonLayout;