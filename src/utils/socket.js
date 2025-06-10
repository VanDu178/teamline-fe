// socket.js
import { io } from 'socket.io-client';

let socket = null;

export const connectSocket = (userId, token) => {
    if (!socket) {
        socket = io(process.env.REACT_APP_BACKEND_URL, {
            auth: { userId, token },
        });

        socket.on('connect', () => {
            console.log('Socket connected:', socket.id);
            socket.emit('register', { userId });  // Gửi event register khi kết nối
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });
    }

    return socket;
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
        socket = null; // Clear socket instance
    }
};
