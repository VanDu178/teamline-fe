// useUnloadWarning.ts
import { useEffect } from "react";

/**
 * Hook cảnh báo người dùng khi đang thực hiện tác vụ chưa hoàn tất.
 * @param shouldWarn - true nếu đang có tác vụ cần cảnh báo
 * @param message - tùy chọn: thông báo tùy chỉnh
 */

export function useWarning(shouldWarn, message) {
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!shouldWarn) return;
      e.preventDefault();
      // Một số trình duyệt cần `returnValue` để hiển thị cảnh báo
      e.returnValue =
        message ||
        "Bạn có chắc muốn rời đi? Những thay đổi có thể chưa được lưu.";
      return e.returnValue;
    };

    const handleUnload = () => {
      //Xử lý khi người dùng thật sự reload trang hoặc chuyển tap
      console.log("Người dùng đã rời trang khi đang upload");
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("unload", handleUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("unload", handleUnload);
    };
  }, [shouldWarn, message]);
}
