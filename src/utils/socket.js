import { io } from 'socket.io-client';
import { handleTokenExpired } from '../configs/socketEmitter';
// import { useChat } from '../contexts/ChatContext';

let socket = null;
let chatStore = null; // Biến toàn cục để lưu context

export const setChatStore = (store) => {
    chatStore = store;
};

export const connectSocket = () => {
    if (!socket) {
        socket = io(process.env.REACT_APP_BACKEND_URL, {
            withCredentials: true,
            transports: ['websocket'],
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('register'); // Gửi sự kiện đăng ký khi kết nối
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on('token-expired', async (data) => {
            await handleTokenExpired();
            console.log(data);
        });

        socket.on('token-invalid', (data) => {
            console.log(data);
        });
    }

    return socket;
};

export const registerSocketEvents = (socket) => {
    if (!socket || !chatStore) return;

    const { setUserId, setUsername, setMessages } = chatStore;

    // socket.on('connect_error', (error) => {
    //     console.error('Connection error:', error);
    // });

    // socket.on('registered', ({ userId, username }) => {
    //     console.log(`Đăng ký thành công: userId=${userId}, username=${username}`);
    //     setUserId(userId);
    //     setUsername(username);
    // });

    socket.on('private-message', ({ fromUserId, fromUsername, message, messageId, sentAt }) => {
        setMessages((prev) => [
            ...prev,
            {
                fromUserId,
                fromUsername: fromUsername || 'Người dùng ẩn danh',
                text: message,
                time: new Date(sentAt).toLocaleTimeString(),
            },
        ]);
    });

    socket.on('message-sent', (data) => {
        console.log('Message sent confirmation:', data);
    });

    socket.on('error', ({ message }) => {
        console.error('Server error:', message);
        alert(`Lỗi: ${message}`);
    });
};

export const getSocket = () => {
    if (!socket) {
        console.warn('Socket is not connected yet.');
    }
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        console.log('Socket disconnected');
        socket = null;
    }
};
