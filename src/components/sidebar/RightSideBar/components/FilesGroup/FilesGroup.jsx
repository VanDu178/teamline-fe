import React, { useState } from 'react';

const FilesGroup = ({ openDropdown }) => {
    const [isOpen, setIsOpen] = useState(true);

    const filesContent = (
        <div className="rs-section">
            <div className="rs-file-list">
                <div className="rs-file-item">Tài liệu.docx <span>14/06/2025</span></div>
                <div className="rs-file-item">Hình ảnh.jpg <span>13/06/2025</span></div>
                <div className="rs-file-item">Báo cáo.pdf <span>12/06/2025</span></div>
            </div>
        </div>
    );

    return (
        <div className="rs-group-files">
            <div className="rs-section-header">
                <span className="rs-section-title">File</span>
                <button className="rs-toggle-btn" onClick={() => setIsOpen(!isOpen)}>
                    {isOpen ? '▼' : '▲'}
                </button>
            </div>
            {isOpen && (
                <>
                    <div className="rs-section">
                        <div className="rs-file-list">
                            <div className="rs-file-item">Tài liệu.docx <span>14/06/2025</span></div>
                            <div className="rs-file-item">Hình ảnh.jpg <span>13/06/2025</span></div>
                            <div className="rs-file-item">Báo cáo.pdf <span>12/06/2025</span></div>
                        </div>
                        <div className="rs-section rs-view-all">
                            <span onClick={() => openDropdown('File', filesContent)}>Xem nhiều hơn</span>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default FilesGroup;