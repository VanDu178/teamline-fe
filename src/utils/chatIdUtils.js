// chatIdUtils.js

/**
 * Hàm tạo localChatId dạng: chatId_xxxxxxxx
 * @returns {string} localChatId
 */
export const generateLocalChatId = () => {
    return "chatId_" + Math.random().toString(36).substring(2, 10);
};

/**
 * Hàm kiểm tra một chatId có phải là localChatId không
 * @param {string} chatId
 * @returns {boolean}
 */
export const isLocalChatId = (chatId) => {
    return typeof chatId === 'string' && chatId.startsWith('chatId_');
};
