import axios, { AxiosResponse, AxiosError } from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
});

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
  },
);
