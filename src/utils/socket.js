import { io } from "socket.io-client";
import { handleTokenExpired } from "../configs/socketEmitter";
import axiosInstance from "../configs/axiosInstance";
import { playSound } from "../utils/soundPlayer";
import { toast } from "react-toastify";
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

  const {
    setMessages,
    roomIdRef,
    setChats,
    chatsRef,
    setRoomId,
    isSearchingRef,
    isNotificationOpenRef,
    setNotifications,
    notificationCountRef,
    setNotificationCount,
    notificationRef,
    notifications,
  } = chatStore;
  //Hàm update chats dùng chung cho các event
  const updateChatList = async ({
    chatId,
    lastMessage,
    axiosInstance,
    setChats,
  }) => {
    const chats = chatsRef?.current || [];
    const existingIndex = chats.findIndex((c) => c._id === chatId);
    if (existingIndex !== -1) {
      const updatedChat = {
        ...chats[existingIndex],
        lastMessage,
      };

      const newChats = [
        updatedChat,
        ...chats.slice(0, existingIndex),
        ...chats.slice(existingIndex + 1),
      ];

      setChats(newChats);
    } else {
      try {
        const res = await axiosInstance.get(`/chats/${chatId}`);
        const newChat = res?.data;
        if (newChat) {
          setChats((prev) => [newChat, ...prev]);
        }
      } catch (err) {
        console.error("Không thể fetch chat mới:", err);
      }
    }
  };

  socket.on("received-message", async (msg) => {
    playSound();
    if (msg.sender === userId) return;
    const roomId = roomIdRef?.current;
    // Nếu đang trong phòng chat đó, thêm tin nhắn
    if (msg?.chat?._id === roomId) {
      setMessages((prev) => [...prev, msg]);
    }
    if (!isSearchingRef.current) {
      await updateChatList({
        chatId: msg?.chat?._id,
        lastMessage: msg,
        axiosInstance,
        setChats,
      });
    }
  });

  socket.on("message-sent", async (data) => {
    console.log("Message sent confirmation:", data);
    const {
      chatId,
      sentAt,
      status,
      localId,
      messageId,
      messageContent,
      messageSender,
      localChatId,
    } = data;

    if (!isSearchingRef.current) {
      await updateChatList({
        chatId,
        lastMessage: {
          content: messageContent,
          sender: messageSender,
          createdAt: sentAt,
        },
        axiosInstance,
        setChats,
      });
    }

    if (localChatId === roomIdRef?.current) {
      console.log("chay tk này");
      setRoomId(chatId);
      return;
    }

    if (status === "saved") {
      console.log("2");
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

  socket.on("group-new", ({ newGroup }) => {
    playSound();
    if (!isSearchingRef.current) {
      const chats = chatsRef?.current || [];
      const exists = chats.some((chat) => chat._id === newGroup._id);
      if (exists) return;
      setChats((prev) => [newGroup, ...prev]);
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

  socket.on("notification-new", (newNotification) => {
    playSound();

    if (isNotificationOpenRef.current === true) {
      const updatedNotifications = [
        newNotification,
        ...notificationRef.current,
      ];
      setNotifications(updatedNotifications);
      toast.info("Bạn có thông báo mới");
    }

    const currentCount = notificationCountRef.current ?? 0;
    setNotificationCount(currentCount + 1);
  });

  socket.on("user-joined-group", async (data) => {
    //Nó sẽ kêu 2 lần vì ngưởi gửi sự kiện accept cũng nhận sự kiện
    playSound();
    const { userId, userName, groupId } = data;
    console.log(
      "dữ liệu được gửi từ backend lên:",
      userId,
      "...",
      userName,
      "...",
      groupId
    );
    // //check nếu noti và search không đanh mở thì cập nhật lại chatlist,
    if (isSearchingRef.current) {
      console.log(
        "Sau này sẽ tạo thông báo chuông + thông báo có tin nhắn đang chờ ở đây"
      );
      return;
    }
    // //cập nhật chatlist ở đây
    await updateChatList({
      chatId: groupId,
      lastMessage: null,
      axiosInstance,
      setChats,
    });
  });

  socket.on("error", ({ message }) => {
    console.error("Server error:", message);
    alert(`Lỗi: ${message}`);
  });

  socket.on("send-error", ({ message, localId }) => {
    console.error("Send error:", message);

    // Cập nhật lại message, xóa trường updatedAt
    setMessages((prevMessages) =>
      prevMessages.map((msg) =>
        msg.localId === localId
          ? (() => {
              const { updatedAt, ...rest } = msg; // Xóa updatedAt
              return rest;
            })()
          : msg
      )
    );
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
