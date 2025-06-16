import { io } from "socket.io-client";
import { handleTokenExpired } from "../configs/socketEmitter";
import axiosInstance from "../configs/axiosInstance";
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

  const { setMessages, roomIdRef, setChats, chatsRef, setRoomId } = chatStore;

  socket.on("received-message", async (msg) => {
    alert("nhận");
    if (msg.sender === userId) return;

    const roomId = roomIdRef?.current;

    // Nếu đang trong phòng chat đó, thêm tin nhắn
    if (msg.chat === roomId) {
      setMessages((prev) => [...prev, msg]);
    }

    // Cập nhật danh sách chat
    const chats = chatsRef?.current || [];
    const existingIndex = chats.findIndex((c) => c._id === msg.chat);

    if (existingIndex !== -1) {
      // Đã có: cập nhật lastMessage và đẩy lên đầu
      const updatedChat = {
        ...chats[existingIndex],
        lastMessage: msg,
      };

      const newList = [
        updatedChat,
        ...chats.slice(0, existingIndex),
        ...chats.slice(existingIndex + 1),
      ];

      setChats(newList);
    } else {
      // Chưa có: fetch chat từ API và thêm vào đầu
      try {
        const res = await axiosInstance.get(`/chats/${msg.chat}`);
        const newChat = res.data;
        if (newChat) {
          setChats((prev) => [newChat, ...prev]);
        }
      } catch (err) {
        console.error("Không thể fetch chat mới:", err);
      }
    }
  });

  // socket.on("message-sent", (data) => {
  //   console.log("Message sent confirmation:", data);
  //   const { chatId, sentAt, status, localId, messageId } = data;

  //   if (status === "saved") {
  //     setMessages((prevMessages) =>
  //       prevMessages.map((msg) =>
  //         msg.localId === localId
  //           ? {
  //               ...msg,
  //               chat: chatId,
  //               createdAt: sentAt,
  //               updatedAt: sentAt,
  //               _id: messageId,
  //             }
  //           : msg
  //       )
  //     );
  //   }
  // });

  socket.on("message-sent", (data) => {
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

    console.log('localChatId', localChatId);
    console.log("roomud", roomIdRef?.current);
    if (localChatId === roomIdRef?.current) {
      alert("vo day");
      setRoomId(chatId);
      return;
    }

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

      // Cập nhật danh sách chats
      setChats((prevChats) => {
        const existing = prevChats.find((c) => c._id === chatId);
        if (!existing) return prevChats; // nếu không có sẵn, không làm gì

        const updatedChat = {
          ...existing,
          lastMessage: {
            ...existing.lastMessage,
            content: messageContent, // hoặc lấy từ msg nếu có
            sender: messageSender, // có thể để userID hoặc gì đó nếu cần
            createdAt: sentAt,
          },
        };

        // Đưa chat đó lên đầu danh sách
        const newChats = [
          updatedChat,
          ...prevChats.filter((c) => c._id !== chatId),
        ];
        return newChats;
      });

      // cập nhật ref nếu có
      if (chatsRef?.current) {
        chatsRef.current = chatsRef.current.filter((c) => c._id !== chatId);
        const updated = {
          ...chatsRef.current.find((c) => c._id === chatId),
          lastMessage: {
            content: "...",
            sender: { _id: "self" },
            createdAt: sentAt,
          },
        };
        chatsRef.current = [updated, ...chatsRef.current];
      }
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
