import axios from "axios";
import { serverApi } from "./config";

declare module "axios" {
  interface AxiosRequestConfig {
    // background calls that must not redirect to the login page on 401
    skipAuthRedirect?: boolean;
  }
}

const axiosInstance = axios.create({
  baseURL: serverApi,
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const message: string = error.response?.data?.message ?? "";
    const url: string = error.config?.url ?? "";
    const isAuthCall = url.startsWith("/user/login") || url.startsWith("/user/signup");

    if (!isAuthCall && !error.config?.skipAuthRedirect) {
      // only a missing/expired session logs you out; a wrong current password (also 401) does not
      if (status === 401 && /not authenticated/i.test(message)) {
        localStorage.removeItem("userData");
        window.location.assign("/login?expired=1");
      } else if (status === 403 && /blocked/i.test(message)) {
        localStorage.removeItem("userData");
        window.location.assign("/login?blocked=1");
      }
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
