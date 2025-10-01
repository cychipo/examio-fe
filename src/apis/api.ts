import axios, {
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { LOCALSTORAGE_KEY } from "@/types/localstorage";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
});

api.interceptors.request.use(authRequestInterceptor);
function authRequestInterceptor(config: InternalAxiosRequestConfig) {
  if (config.headers) {
    const token = localStorage.getItem(LOCALSTORAGE_KEY.ACCESS_TOKEN);
    if (token) {
      config.headers.authorization = `Bearer ${token.replace(/"/g, "")}`;
    }
  }
  return config;
}

api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.data) {
      type ErrorResponseData = { message?: string; error?: string };
      const errorData = error.response.data as ErrorResponseData;

      if (errorData.message) {
        console.error("Backend Error:", errorData.message);
        throw new Error(errorData.message);
      }

      if (errorData.error) {
        console.error("Backend Error:", errorData.error);
        throw new Error(errorData.error);
      }
    }
    return Promise.reject(error);
  }
);
