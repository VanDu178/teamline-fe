import HeaderGroup from '../components/HeaderGroup/HeaderGroup';
import RemindersGroup from '../components/RemindersGroup/RemindersGroup';
import MediaGroup from '../components/MediaGroup/MediaGroup';
import FilesGroup from '../components/FilesGroup/FilesGroup';
import LinksGroup from '../components/LinksGroup/LinksGroup';
import SecurityGroup from '../components/SecurityGroup/SecurityGroup';
import ActionsGroup from '../components/ActionsGroup/ActionsGroup';
import './index.css';
// import Footer from './Footer';

const RightSidebar = () => (
    <div className="rs-right-sidebar">
        <HeaderGroup />
        <RemindersGroup />
        <MediaGroup />
        <FilesGroup />
        <LinksGroup />
        <SecurityGroup />
        <ActionsGroup />
    </div>
);

export default RightSidebar;