import axios from "axios";
import { serverApi } from "./config";

const axiosInstance = axios.create({
  baseURL: serverApi,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest =
      error.config?.url === "/user/login" || error.config?.url === "/user/signup";

    if ((error.response?.status === 401 || error.response?.status === 403) && !isAuthRequest) {
      localStorage.removeItem("userData");
      window.location.href = "/auth";
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;