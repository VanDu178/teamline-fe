import axiosInstance from "../configs/axiosInstance";

const CHUNK_SIZE = 1 * 1024 * 1024; // 1MB
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // milliseconds

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const uploadChunkWithRetry = async (url, formData, retries = MAX_RETRIES) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await axiosInstance.post(url, formData);
      return; //Thành công
    } catch (err) {
      const status = err?.response?.status;
      const retriable = !status || (status >= 500 && status < 600); // timeout, 5xx

      if (!retriable || attempt === retries) {
        console.error(`Chunk upload failed at attempt ${attempt}`, err);
        throw err;
      }
      console.warn(
        `Retry chunk upload (attempt ${attempt}) in ${RETRY_DELAY}ms`
      );
      await sleep(RETRY_DELAY);
    }
  }
};

export const uploadInChunks = async (file, onProgress) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${file.name}-${file.size}-${Date.now()}`;
  // Check for missing fileId or chunkIndex error from server (400)
  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    const formData = new FormData();
    formData.append("chunk", chunk);
    formData.append("fileId", fileId);
    formData.append("chunkIndex", i);
    formData.append("totalChunks", totalChunks);
    formData.append("fileName", file.name);
    formData.append("fileSize", file.size);

    const uploadUrl = `/file/upload/chunk?fileId=${fileId}&chunkIndex=${i}`;
    try {
      await uploadChunkWithRetry(uploadUrl, formData);
      // Gọi callback sau mỗi chunk
      const percent = Math.round(((i + 1) / totalChunks) * 100);
      if (onProgress) {
        onProgress(percent);
      }
    } catch (error) {
      throw new Error(
        `Lỗi khi upload chunk ${i}: ${
          error?.response?.data?.error || error.message
        }`
      );
      //Bên chatbox sẽ xử lý lỗi chỗ upload fail khi nhận cái này.
    }
  }

  // Sau khi upload xong tất cả các chunk
  try {
    const response = await axiosInstance.post("/file/upload/complete", {
      fileId,
      fileName: file.name,
    });
    return response;
  } catch (error) {
    throw new Error(
      `Lỗi khi merge file và upload file lên google drive: ${
        error?.response?.data?.error || error.message
      }`
    );
  }
};
