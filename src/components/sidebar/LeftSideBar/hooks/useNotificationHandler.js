import { emitSocketEvent } from "../../../../configs/socketEmitter";
import { useAuth } from "../../../../contexts/AuthContext";
import { useNotification } from "../../../../contexts/NotificationContext";
import { toast } from "react-toastify";
import axiosInstance from "../../../../configs/axiosInstance";
import useNotificationBoxHandler from "./useNotificationBoxHandler";
import Swal from "sweetalert2";

const useNotificationHandler = () => {
  const { user } = useAuth();
  const {
    setNotifications,
    notificationsToMarkReadRef,
    notificationsToDismissRef,
  } = useNotification();

  const { handleDeleteNotification } = useNotificationBoxHandler();

  //Các hàm xử lý hành động cho loại notification "Gửi lời mời vào nhóm chat"
  const acceptGroupInvite = async (groupId, notifId) => {
    const data = {
      notifId,
      groupId,
      userName: user?.name,
    };
    try {
      const response = await emitSocketEvent("accept-group-invite", data);
      console.log("gias trij trss", response);
      if (response?.error) {
        toast.error(response?.message);
      } else {
        handleDeleteNotification(notifId);
        toast.success(response?.message);
      }
    } catch (err) {
      console.error("Lỗi khi gửi sự kiện:", err);
    }
  };

  const rejectGroupInvite = async (notifId) => {
    notificationsToMarkReadRef.current.add(notifId);
    const result = await Swal.fire({
      title: "Từ chối lời mời?",
      text: "Bạn có chắc chắn muốn từ chối lời mời vào nhóm chat này không?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Từ chối",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        //gọi xuống backend chỉnh sửa
        const res = await axiosInstance.patch(
          `/notifications/dismiss/${notifId}`
        );
        //cắt giá trị noti
        handleDeleteNotification(notifId);
        console.log("Đã từ chối lời mời, notifId:", notifId);
        toast.success("Đã từ chối lời mời.");
      } catch (err) {
        console.error("Lỗi khi từ chối lời mời:", err);
        toast.error("Đã xảy ra lỗi khi từ chối.");
      }
    }
  };

  return {
    acceptGroupInvite,
    rejectGroupInvite,
  };
};

export default useNotificationHandler;
