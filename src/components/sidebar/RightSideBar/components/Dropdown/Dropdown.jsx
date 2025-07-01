const Dropdown = ({ title, content, onClose, width, top, left }) => {
    const getRepresentativeImage = () => {
        switch (title) {
            case 'Ảnh/Video':
                return 'https://via.placeholder.com/150?text=Media';
            case 'File':
                return 'https://via.placeholder.com/150?text=File';
            case 'Link':
                return 'https://via.placeholder.com/150?text=Link';
            default:
                return '';
        }
    };

    return (
        <div
            className="rs-dropdown"
            style={{
                width: `${width}px`,
                top: `${top}px`,
                left: `${left}px`,
            }}
        >
            <h3 className="rs-dropdown-title">{title}</h3>
            {getRepresentativeImage() && (
                <img
                    src={getRepresentativeImage()}
                    alt={`${title} Representative`}
                    className="rs-dropdown-image"
                />
            )}
            <div className="rs-dropdown-content">{content}</div>
            <div className="rs-dropdown-close">
                <span onClick={onClose}>Đóng</span>
            </div>
        </div>
    );
};

export default Dropdown;