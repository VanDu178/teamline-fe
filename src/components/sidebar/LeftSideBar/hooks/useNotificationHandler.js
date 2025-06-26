import { emitSocketEvent } from "../../../../configs/socketEmitter";
import { useAuth } from "../../../../contexts/AuthContext";
import { useChat } from "../../../../contexts/ChatContext";
import { toast } from "react-toastify";
import axiosInstance from "../../../../configs/axiosInstance";
import Swal from "sweetalert2";

const useNotificationHandler = () => {
  const { user } = useAuth();
  const { setNotifications, setNotificationCount } = useChat();

  //Các hàm xử lý hành động cho loại notification "Gửi lời mời vào nhóm chat"
  const acceptGroupInvite = async (groupId, notifId) => {
    const data = {
      notifId,
      groupId,
      userName: user?.name,
    };
    try {
      console.log("đã chạy sự kiện");
      const response = await emitSocketEvent("accept-group-invite", data);
      if (response?.error) {
        toast.error(response?.message);
      } else {
        toast.success(response?.message);
      }
    } catch (err) {
      console.error("Lỗi khi gửi sự kiện:", err);
    }
  };

  const rejectGroupInvite = async (notifId) => {
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
        setNotifications((prev) => prev.filter((n) => n._id !== notifId));
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
