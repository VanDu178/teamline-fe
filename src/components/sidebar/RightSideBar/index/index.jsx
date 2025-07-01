import React, { useState, useRef, useEffect } from 'react';
import './index.css';
import HeaderGroup from '../components/HeaderGroup/HeaderGroup';
import RemindersGroup from '../components/RemindersGroup/RemindersGroup';
import MediaGroup from '../components/MediaGroup/MediaGroup';
import FilesGroup from '../components/FilesGroup/FilesGroup';
import LinksGroup from '../components/LinksGroup/LinksGroup';
import SecurityGroup from '../components/SecurityGroup/SecurityGroup';
import ActionsGroup from '../components/ActionsGroup/ActionsGroup';
import Dropdown from "../components/Dropdown/Dropdown";

const RightSidebar = () => {
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [dropdownContent, setDropdownContent] = useState({ title: '', content: null });
    const sidebarRef = useRef(null);

    const openDropdown = (title, content) => {
        setDropdownContent({ title, content });
        setIsDropdownOpen(true);
    };

    const closeDropdown = () => {
        setIsDropdownOpen(false);
        setDropdownContent({ title: '', content: null });
    };

    const [sidebarRect, setSidebarRect] = useState({ width: 0, top: 0, left: 0 });
    useEffect(() => {
        if (sidebarRef.current) {
            const rect = sidebarRef.current.getBoundingClientRect();
            setSidebarRect({
                width: rect.width,
                top: rect.top + window.scrollY,
                left: rect.left + window.scrollX,
            });
        }
    }, []);

    return (
        <>
            <div className="rs-right-sidebar" ref={sidebarRef}>
                <HeaderGroup />
                <RemindersGroup />
                <MediaGroup openDropdown={openDropdown} />
                <FilesGroup openDropdown={openDropdown} />
                <LinksGroup openDropdown={openDropdown} />
                <SecurityGroup />
                <ActionsGroup />
            </div>
            {isDropdownOpen && (
                <Dropdown
                    title={dropdownContent.title}
                    content={dropdownContent.content}
                    onClose={closeDropdown}
                    width={sidebarRect.width}
                    top={sidebarRect.top}
                    left={sidebarRect.left}
                />
            )}
        </>
    );
};

export default RightSidebar;