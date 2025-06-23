import { useState } from "react";

const useAvatarMenu = ({
  activeIcon,
  setActiveIcon,
  setIsUserInfoModalOpen,
  setIsSettingsModalOpen,
  setIsNotificationOpen,
}) => {
  const [isAvataOpen, setIsAvataOpen] = useState(false);

  const handleAvatarClick = () => {
    setIsAvataOpen(!isAvataOpen);
    setIsNotificationOpen(false);
    setActiveIcon(activeIcon === "avatar" ? null : "avatar");
  };

  const handleOpenUserInfoModal = () => {
    setIsUserInfoModalOpen(true);
    setIsAvataOpen(false);
    setActiveIcon(null);
  };

  const handleOpenSettingModal = () => {
    setIsSettingsModalOpen(true);
  };

  const handleCloseSettingsModal = () => {
    setIsAvataOpen(false);
    setIsSettingsModalOpen(false);
  };

  return {
    isAvataOpen,
    setIsAvataOpen,
    handleAvatarClick,
    handleOpenUserInfoModal,
    handleCloseSettingsModal,
    handleOpenSettingModal,
  };
};

export default useAvatarMenu;
