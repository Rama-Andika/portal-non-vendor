import type { TResponse } from "@/types/response.type";
import axios from "axios";
import Cookies from "js-cookie";

type TokenUser = {
  token: string;
  refreshToken: string;
};

const url = import.meta.env.VITE_API_URL as string;
const basename = import.meta.env.VITE_BASENAME;

const axiosInstance = axios.create({
  baseURL: url,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const userCookies = Cookies.get("admin-token");
    let user: TokenUser | undefined;
    try {
      if (userCookies && userCookies !== "undefined") {
        user = JSON.parse(userCookies);
      }
    } catch (e) {
      // Ignored
    }

    if (user && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/rest/auth/login") &&
      !originalRequest.url?.includes("/rest/portal/non-vendor/login")
    ) {
      originalRequest._retry = true;

      try {
        const userCookies = Cookies.get("admin-token");
        let user: TokenUser | undefined;
        try {
          if (userCookies && userCookies !== "undefined") {
            user = JSON.parse(userCookies);
          }
        } catch (e) {
          // Ignored
        }

        const response = await axios.post(`${url}/rest/auth/refresh`, {
          refreshToken: user?.refreshToken,
        });

        const result: TResponse<TokenUser> = response.data;
        const token = result.data?.token;
        originalRequest.headers.Authorization = `Bearer ${token}`;

        Cookies.set("admin-token", JSON.stringify(result.data), { path: basename });
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        Cookies.remove("admin-token", { path: basename });
        window.location.href = `${basename}/login`;
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  },
);

export default axiosInstance;
