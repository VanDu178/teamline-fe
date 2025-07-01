import {
  getSocket,
  connectSocket,
  disconnectSocket,
  registerSocketEvents,
} from "../utils/socket"; // Thêm registerSocketEvents
import axiosInstance from "../configs/axiosInstance";
import Cookies from "js-cookie";
import { joinRoomFunction } from "../layouts/Main/Main";

let pendingEvent = null;
let isRefreshing = false;

export const emitSocketEvent = (event, data) => {
  pendingEvent = { event, data };
  const currentSocket = getSocket();

  return new Promise((resolve, reject) => {
    if (!currentSocket || currentSocket.disconnected) {
      console.warn("Socket is not connected.");
      return reject("Socket is not connected.");
    }

    currentSocket.emit(event, data, async (response) => {
      if (response === "token-expired") {
        const refreshedResponse = await handleTokenExpired();
        resolve(refreshedResponse);
      } else {
        console.log("dulieu chua het han", response);
        resolve(response);
      }
    });
  });
};

// export const emitSocketEvent = (event, data) => {
//   pendingEvent = { event, data };
//   const currentSocket = getSocket();
//   if (!currentSocket || currentSocket.disconnected) {
//     console.warn("Socket is not connected.");
//     return;
//   }

//   // currentSocket.emit(event, data);
//   currentSocket.emit(event, data, (response) => {
//     if (response === "token-expired") {
//       console.log("dulieu", response);
//       return handleTokenExpired();
//     }
//     console.log("dulieu chua het han", response);
//     return response;
//   });
// };

// export const handleTokenExpired = async () => {
//   console.log("Handling token expiration...");
//   const currentSocket = getSocket();
//   let responseCallback = null;
//   if (!isRefreshing && currentSocket) {
//     isRefreshing = true;

//     try {
//       const res = await axiosInstance.post("/auth/refresh-token", null, {
//         withCredentials: true,
//       });
//       if (res.status === 200) {
//         Cookies.remove("isLoggedIn");
//         Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
//         console.log("Refresh token success, retry original request");
//       }

//       // Ngắt kết nối socket cũ
//       disconnectSocket();

//       // Kết nối socket mới
//       const newSocket = connectSocket();

//       // Gửi lại sự kiện cũ sau khi đăng ký xong
//       newSocket.on("user-joined", () => {
//         if (pendingEvent) {
//           console.log("Resending last event:", pendingEvent.event);
//           // newSocket.emit(pendingEvent.event, pendingEvent.data);
//           newSocket.emit(pendingEvent.event, pendingEvent.data, (response) => {
//             responseCallback = response;
//           });
//           //nếu sự kiện bị chặn do token hết hạn trước đó là join room thì không cần join nữa
//           if (pendingEvent.event !== "join-room") {
//             joinRoomFunction();
//           }
//           pendingEvent = null;
//         } else {
//           // Không có pending thì vẫn phải join lại room
//           joinRoomFunction();
//         }

//         // Đăng ký lại các sự kiện, vì socket là một instance nên khi ngắt kết nối và tạo token mới thì
//         //lúc đó các sự kiện đăng kí lúc đầu không còn nữa
//         registerSocketEvents(newSocket);
//       });

//       isRefreshing = false;
//       console.log("asdsa", responseCallback);
//       return responseCallback;
//     } catch (err) {
//       console.error("Refresh token failed:", err);
//       alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
//       isRefreshing = false;
//     }
//   }
// };

export const handleTokenExpired = async () => {
  console.log("Handling token expiration...");
  const currentSocket = getSocket();

  if (!isRefreshing && currentSocket) {
    console.log("ádasadco chay vao rong");
    isRefreshing = true;

    try {
      const res = await axiosInstance.post("/auth/refresh-token", null, {
        withCredentials: true,
      });

      if (res.status === 200) {
        Cookies.remove("isLoggedIn");
        Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
        console.log("Refresh token success, retry original request");
      }

      // Ngắt kết nối socket cũ
      disconnectSocket();

      // Kết nối socket mới
      const newSocket = connectSocket();

      // Đợi đến khi sự kiện "user-joined" được xử lý và resend thành công
      const responseCallback = await new Promise((resolve) => {
        newSocket.on("user-joined", () => {
          if (pendingEvent) {
            console.log("Resending last event:", pendingEvent.event);

            newSocket.emit(
              pendingEvent.event,
              pendingEvent.data,
              (response) => {
                resolve(response);
              }
            );

            if (pendingEvent.event !== "join-room") {
              joinRoomFunction();
            }

            pendingEvent = null;
          } else {
            // Không có pending thì vẫn phải join lại room
            joinRoomFunction();
            resolve(null); // Không có gì để resend, nhưng vẫn kết thúc Promise
          }

          // Đăng ký lại các sự kiện vì socket mới
          registerSocketEvents(newSocket);
        });
      });

      isRefreshing = false;
      console.log("Response from resent event:", responseCallback);
      return responseCallback;
    } catch (err) {
      console.error("Refresh token failed:", err);
      alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
      isRefreshing = false;
    }
  }
};
