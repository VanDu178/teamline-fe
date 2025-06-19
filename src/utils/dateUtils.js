export const formatMessageDate = (dateString) => {
    if (!dateString) return 'Đang gửi...';

    // Chuyển về giờ Việt Nam
    const msgDate = new Date(new Date(dateString).toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));
    const nowVN = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

    // Hàm so sánh ngày
    const isSameDate = (d1, d2) =>
        d1.getDate() === d2.getDate() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getFullYear() === d2.getFullYear();

    if (isSameDate(msgDate, nowVN)) return 'Hôm nay';

    // Tạo ngày hôm qua
    const yesterdayVN = new Date(nowVN);
    yesterdayVN.setDate(yesterdayVN.getDate() - 1);

    if (isSameDate(msgDate, yesterdayVN)) return 'Hôm qua';

    // Trả về dạng dd/mm/yyyy
    return `${msgDate.getDate().toString().padStart(2, '0')}/${(msgDate.getMonth() + 1).toString().padStart(2, '0')}/${msgDate.getFullYear()}`;
};

