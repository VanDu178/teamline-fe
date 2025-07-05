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
      console.log("đã có lỗi xảy ra khi tải chunk", err);
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

// Hàm kiểm tra những chunk đã được upload từ backend
export const getUploadedChunks = async (fileId) => {
  try {
    const response = await axiosInstance.get(`/file/upload/status/${fileId}`);
    console.log(response);
    console.log(response.data?.uploadedChunks);
    return response.data?.uploadedChunks || [];
  } catch (err) {
    console.warn("Không thể lấy danh sách chunk đã upload:", err.message);
    return []; // Trả về mảng rỗng nếu lỗi (coi như lần đầu upload)
  }
};

export const uploadInChunks = async (userId, roomId, file, onProgress) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  const fileId = `${userId}-${roomId}-${file.name}-${file.size}-${file.lastModified}`;
  const uploadedChunks = await getUploadedChunks(fileId);

  for (let i = 0; i < totalChunks; i++) {
    // Nếu chunk đã tồn tại dưới backedn thì bỏ qua
    if (uploadedChunks.includes(i)) {
      if (onProgress) {
        const percent = Math.round(((i + 1) / totalChunks) * 100);
        onProgress(percent);
      }
      continue;
    }
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
      const status = error?.response?.status;
      const retriable = !status || (status >= 500 && status < 600);

      if (!retriable) {
        try {
          await axiosInstance.delete(`/file/upload/${fileId}`);
        } catch (cleanupErr) {
          console.warn("Không thể dọn dẹp dữ liệu chunk:", cleanupErr.message);
        }
      }
      //Xử lý set trạng thái của message đó đang lỗi, và hiển thị lỗi (xử lý bên catch lỗi của chatbox)
      //sẽ hiển thị retry nếu là lỗi mạng
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
    //check nếu lỗi mạng thì cho retry (xử lý bên catch lỗi của chatbox)
    //set trạng thái của message đó là lỗi và hiển thị lỗi (xử lý bên catch lỗi của chatbox)
    const status = error?.response?.status;
    const retriable = !status || (status >= 500 && status < 600);

    if (!retriable) {
      try {
        await axiosInstance.delete(`/file/upload/${fileId}`);
      } catch (cleanupErr) {
        console.warn("Không thể dọn dẹp sau lỗi merge:", cleanupErr.message);
      }
    }

    throw new Error(
      `Lỗi khi merge file và upload file lên Google Drive: ${
        error?.response?.data?.error || error.message
      }`
    );
  }
};
