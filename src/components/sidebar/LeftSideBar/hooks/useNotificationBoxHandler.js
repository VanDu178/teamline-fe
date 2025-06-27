import { useEffect, useRef, useState } from "react";
import axiosInstance from "../../../../configs/axiosInstance";
import { useChat } from "../../../../contexts/ChatContext";
import { useNotification } from "../../../../contexts/NotificationContext";

const useNotificationBoxHandler = () => {
  const [cursor, setCursor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const loadMoreRef = useRef();
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const prevIsNotificationOpenRef = useRef(false);
  const didMountRef = useRef(false);

  const {
    notifications,
    setNotifications,
    isNotificationOpenRef,
    notificationRef,
    notificationCountRef,
    setNotificationCount,
    notificationCount,
    notificationsToDismissRef,
    notificationsToMarkReadRef,
  } = useNotification();

  //Lấy số lượng notification user chưa đọc
  useEffect(() => {
    // axiosInstance.patch("/notifications/mark-all-read");
    getUnreadNotificationCount();
  }, []);

  //Xử lý theo dõi để auto mark-as-read cho notification khi người dùng mở notibox
  useEffect(() => {
    if (!isNotificationOpen || notifications.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const notiInfo = JSON.parse(entry.target.dataset.notificationInfo);
            const { notificationId, isRead } = notiInfo;
            if (!isRead) {
              const timer = setTimeout(() => {
                notificationsToMarkReadRef.current.add(notificationId);
                observer.unobserve(entry.target);
              }, 1000);
              entry.target.timer = timer;
            }
          } else {
            if (entry.target.timer) {
              clearTimeout(entry.target.timer);
              entry.target.timer = null;
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    const notificationElements = document.querySelectorAll(".notif-item");
    notificationElements.forEach((el) => observer.observe(el));

    return () => {
      notificationElements.forEach((el) => {
        if (el.timer) clearTimeout(el.timer);
        observer.unobserve(el);
      });
    };
  }, [isNotificationOpen, notifications]);

  useEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      prevIsNotificationOpenRef.current = isNotificationOpen;
      return;
    }

    if (
      prevIsNotificationOpenRef.current === true &&
      isNotificationOpen === false
    ) {
      const idsToMarkRead = Array.from(notificationsToMarkReadRef.current);
      const idsToDismiss = Array.from(notificationsToDismissRef.current);

      if (idsToMarkRead.length > 0) {
        markNotificationsAsRead(idsToMarkRead)
          .then(() => {
            setNotificationCount((prev) => prev - idsToMarkRead.length);
            notificationsToMarkReadRef.current.clear();
          })
          .catch((error) =>
            console.error("Error handling notifications:", error)
          );
      }

      if (idsToDismiss.length > 0) {
        dismissNotifications(idsToDismiss)
          .then(() => {
            notificationsToDismissRef.current.clear();
          })
          .catch((error) =>
            console.error("Error deleting notifications:", error)
          );
      }
    }

    prevIsNotificationOpenRef.current = isNotificationOpen;
  }, [isNotificationOpen]);

  //Load notification lần đầu mở notibox
  useEffect(() => {
    isNotificationOpenRef.current = isNotificationOpen; //cập nhật giá trị mới nhất cho isNotificationOpenRef khi isNotification thay đổi
    if (isNotificationOpen) {
      setNotifications([]);
      setCursor(null);
      loadMore();
    }
  }, [isNotificationOpen]);

  //Mỗi khi notifications thay đổi thì cập nhật giá trị notificationRef cho đồng bố
  useEffect(() => {
    notificationRef.current = notifications;
  }, [notifications]);

  //Mỗi khi notificationCount thay đổi thì cập nhật notificationCountRef cho dồng bộ
  useEffect(() => {
    notificationCountRef.current = notificationCount;
  }, [notificationCount]);

  //Mỗi khi người dùng scroll đến item được theo dõi thì load more nếu còn dư liệu
  useEffect(() => {
    if (!isNotificationOpen) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoading && cursor !== null) {
        loadMore();
      }
    });

    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [isLoading, cursor, isNotificationOpen]);

  //hàm load notification
  const fetchNotifications = async (cursor = null) => {
    try {
      const params = { limit: 10 };
      if (cursor) params.cursor = cursor;
      const res = await axiosInstance.get("/notifications", { params });
      return res.data;
    } catch (error) {
      //check nếu là lỗi từ mạng thì sẽ cho thử lại
      console.log("Đã có lỗi xảy ra khi fetch dữ liệu notification");
    }
  };

  const loadMore = async () => {
    try {
      setIsLoading(true);
      const data = await fetchNotifications(cursor);
      if (cursor) {
        setNotifications((prev) => [...prev, ...data.items]);
      } else {
        setNotifications(data.items);
      }
      setCursor(data.nextCursor);
      setIsLoading(false);
    } catch (error) {
      console.log("Đã xảy ra lỗi trong quá trình load more");
    }
  };

  //hàm load notification count
  const getUnreadNotificationCount = async () => {
    try {
      const res = await axiosInstance.get("/notifications/unread");
      const numberNotificationUnread = res?.data?.unreadCount;
      setNotificationCount(numberNotificationUnread);
    } catch (error) {
      setNotificationCount(0); //Nếu fetch lỗi thì tạm thời set số lượng là 0 luôn
      console.error("Failed to get unread notification count:", error);
    }
  };

  const markNotificationsAsRead = async (notificationIds) => {
    try {
      await axiosInstance.patch("/notifications/mark-read", {
        notificationIds: Array.from(notificationIds),
      });
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const dismissNotifications = async (notificationIds) => {
    try {
      await axiosInstance.patch("/notifications/dismiss-multiple", {
        notificationIds: Array.from(notificationIds),
      });
    } catch (error) {
      console.error("Failed to delete notifications:", error);
    }
  };

  const handleDeleteNotification = (notifId) => {
    notificationsToDismissRef.current.add(notifId);
    notificationsToMarkReadRef.current.add(notifId);
    setNotifications((prev) => prev.filter((n) => n._id !== notifId));
  };

  return {
    loadMoreRef,
    cursor,
    isLoading,
    notifications,
    handleDeleteNotification,
    isNotificationOpen,
    setIsNotificationOpen,
    notificationCount,
    setCursor,
  };
};

export default useNotificationBoxHandler;
