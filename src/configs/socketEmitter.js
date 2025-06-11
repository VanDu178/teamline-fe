import { getSocket, connectSocket, disconnectSocket, registerSocketEvents } from '../utils/socket'; // Thêm registerSocketEvents
import axiosInstance from '../configs/axiosInstance';

let pendingEvent = null;
let isRefreshing = false;

export const emitSocketEvent = (event, data) => {
    pendingEvent = { event, data };
    const currentSocket = getSocket();
    if (!currentSocket || currentSocket.disconnected) {
        console.warn('Socket is not connected.');
        return;
    }

    currentSocket.emit(event, data);
};

export const handleTokenExpired = async () => {
    console.log('Handling token expiration...');
    const currentSocket = getSocket();

    if (!isRefreshing && currentSocket) {
        isRefreshing = true;

        try {
            await axiosInstance.post("/auth/refresh-token", null, {
                withCredentials: true,
            });

            // Ngắt kết nối socket cũ
            disconnectSocket();

            // Kết nối socket mới
            const newSocket = connectSocket();

            // Gửi lại sự kiện cũ sau khi đăng ký xong
            newSocket.on('registered', () => {
                if (pendingEvent) {
                    console.log('Resending last event:', pendingEvent.event);
                    newSocket.emit(pendingEvent.event, pendingEvent.data);
                    pendingEvent = null;
                }
                // Đăng ký lại các sự kiện
                registerSocketEvents(newSocket);
            });

            isRefreshing = false;

        } catch (err) {
            console.error('Refresh token failed:', err);
            alert('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
            isRefreshing = false;
        }
    }
};
