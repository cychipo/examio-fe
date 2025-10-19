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
        console.log("Backend Error:", errorData.message);
        return errorData.message;
      }

      if (errorData.error) {
        console.log("Backend Error:", errorData.error);
        return errorData.error;
      }
    }
    return Promise.reject(error);
  }
);
