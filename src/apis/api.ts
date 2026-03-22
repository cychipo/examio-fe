import axios, {
  AxiosResponse,
  AxiosError,
  InternalAxiosRequestConfig,
} from "axios";
import { getOrCreateDeviceId } from "@/lib/deviceId";
import { MODEL_UNAVAILABLE_MESSAGE } from "@/types/ai";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(authRequestInterceptor);
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.authorization = `Bearer ${token.replace(/"/g, "")}`;
    }

    // Add Device ID header for session tracking
    const deviceId = getOrCreateDeviceId();
    if (deviceId) {
      config.headers["X-Device-ID"] = deviceId;
    }
  }
  return config;
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    // Handle session invalidated (logout from another device)
    if (error.response?.status === 401) {
      type SessionErrorData = { code?: string; message?: string };
      const errorData = error.response.data as SessionErrorData;

      if (errorData.code === "SESSION_INVALIDATED") {
        // Clear auth state and redirect to login
        localStorage.removeItem("auth_token");
        alert("Bạn đã bị đăng xuất từ thiết bị khác");
        window.location.href = "/login";
        return Promise.reject(new Error("Session invalidated"));
      }
    }

    if (error.response?.data) {
      type ErrorResponseData = {
        message?: string;
        error?: string;
        detail?: string | { message?: string; code?: string };
      };
      const errorData = error.response.data as ErrorResponseData;

      const detailMessage =
        typeof errorData.detail === "object"
          ? errorData.detail?.message
          : errorData.detail;
      const detailCode =
        typeof errorData.detail === "object" ? errorData.detail?.code : undefined;

      if (
        detailCode === "MODEL_UNAVAILABLE" ||
        detailCode === "MODEL_INSUFFICIENT_VRAM" ||
        detailCode === "MODEL_RUNTIME_ERROR"
      ) {
        console.log("Backend Error:", detailMessage || MODEL_UNAVAILABLE_MESSAGE);
        return Promise.reject(new Error(MODEL_UNAVAILABLE_MESSAGE));
      }

      if (detailMessage) {
        console.log("Backend Error:", detailMessage);
        return Promise.reject(new Error(detailMessage));
      }

      if (errorData.message) {
        console.log("Backend Error:", errorData.message);
        return Promise.reject(new Error(errorData.message));
      }

      if (errorData.error) {
        console.log("Backend Error:", errorData.error);
        return Promise.reject(new Error(errorData.error));
      }
    }
    return Promise.reject(error);
  }
);
