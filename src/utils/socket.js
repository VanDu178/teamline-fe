import { io } from "socket.io-client";
import { handleTokenExpired } from "../configs/socketEmitter";
import Cookies from "js-cookie";

let socket = null;
let chatStore = null; // Biến toàn cục để lưu context

export const setChatStore = (store) => {
  chatStore = store;
  if (socket) {
    registerSocketEvents(socket);
  }
};

export const connectSocket = () => {
  if (!socket) {
    socket = io(process.env.REACT_APP_BACKEND_URL, {
      withCredentials: true,
      transports: ["websocket"],
    });
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      //join room tổng khi đăng nhập thành công
      socket.emit("join-user", {});
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socket.on("token-expired", async (data) => {
      await handleTokenExpired();
      console.log(data);
    });

    socket.on("token-invalid", (data) => {
      console.log(data);
    });
  }

  return socket;
};

export const registerSocketEvents = (socket) => {
  const userId = Cookies.get("userID");
  if (!socket || !chatStore) return;

  const { setMessages, roomIdRef } = chatStore;

  // sự kiện nhân tin nhắn,
  socket.on("received-message", (msg) => {
    if (msg.sender === userId) {
      return;
    }
    const roomId = roomIdRef?.current;

    // kiểm tra xem tin nhắn có phải được gửi từ nhóm chat đang mở không
    if (msg.chat === roomId) {
      setMessages((prev) => [...prev, msg]);
    }
  });

  socket.on("message-sent", (data) => {
    console.log("Message sent confirmation:", data);
    const { chatId, sentAt, status, localId, messageId } = data;

    if (status === "saved") {
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg.localId === localId
            ? {
                ...msg,
                chat: chatId,
                createdAt: sentAt,
                updatedAt: sentAt,
                _id: messageId,
              }
            : msg
        )
      );
    }
  });

  socket.on("reaction-added", (data) => {
    const { messageId, userId } = data;
    // Cập nhật UI
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, reactions: [...msg.reactions, userId] }
          : msg
      )
    );
  });

  socket.on("reaction-removed", (data) => {
    const { messageId, userId } = data;

    // Cập nhật UI
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg._id === messageId
          ? { ...msg, reactions: msg.reactions.filter((id) => id !== userId) }
          : msg
      )
    );
  });

  socket.on("error", ({ message }) => {
    console.error("Server error:", message);
    alert(`Lỗi: ${message}`);
  });
};

export const getSocket = () => {
  if (!socket) {
    console.warn("Socket is not connected yet.");
  }
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    console.log("Socket disconnected");
    socket = null;
  }
};
