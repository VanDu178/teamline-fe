import axios from "axios";
import Cookies from "js-cookie";

// Tạo đối tượng axios
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL_API,
  withCredentials: true,
});
//Không cần gắng accesstoken trước mỗi request, cái này auto làm, vì accesstoken và refreshtoken được đặt trong http only
// Response interceptor:Xử lý accesstoken hết hạn
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    console.log("Intercept error", error.response?.status, originalRequest.url);
    console.log("error", error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token")
    ) {
      originalRequest._retry = true;
      try {
        console.log("Calling refresh token");
        const res = await axiosInstance.post("/auth/refresh-token", null, {
          withCredentials: true,
        });
        if (res.status === 200) {
          Cookies.remove("isLoggedIn");
          Cookies.set("isLoggedIn", "isAuthenticated", { expires: 7 });
          console.log("Refresh token success, retry original request");
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        console.log("Refresh token failed, redirect to login");
        // window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
