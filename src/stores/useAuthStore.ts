import { create } from "zustand";
import { User } from "@/types/user";
import {
  loginApi,
  signupApi,
  sendCodeResetPasswordApi,
  resetPasswordApi,
  CredentialsLogin,
  CredentialsSignup,
  SendCodeResetPassWordCredentials,
  ResetPasswordCredentials,
  getUserApi,
} from "@/apis/authApi";
import { toast } from "@/components/ui/toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean; // Track initial user check to prevent flash
  login: (credentials: CredentialsLogin) => Promise<void>;
  signup: (credentials: CredentialsSignup) => Promise<void>;
  sendCodeResetPassword: (
    credentials: SendCodeResetPassWordCredentials
  ) => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  logout: () => void;
  getUser: () => void;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  initializing: true, // Start as true to prevent flash

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await loginApi(credentials);
      if (response.success) {
        set({ user: response.user, isAuthenticated: true });
        toast.success("Đăng nhập thành công");

        // Fallback set token
        if (response.token && typeof window !== "undefined") {
          const hasCookie = document.cookie.includes("token=");
          if (!hasCookie) {
            console.warn("Cookie không hoạt động, fallback sang localStorage");
            localStorage.setItem("auth_token", response.token);
          } else {
            localStorage.removeItem("auth_token");
          }
        }

        return Promise.resolve(); // Resolve successfully
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
        console.error(response.message || "Đăng nhập thất bại");
        return Promise.reject(
          new Error(response.message || "Đăng nhập thất bại")
        );
      }
    } catch (error) {
      toast.error((error as Error).message || "Đăng nhập thất bại");
      console.error("Đăng nhập thất bại:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signup: async (credentials) => {
    set({ loading: true });
    try {
      const response = await signupApi(credentials);
      if (response.message) {
        toast.success(response.message);
        set({ user: null, isAuthenticated: false });
      } else {
        toast.error("Đăng ký tài khoản thất bại");
        console.error("Đăng ký tài khoản thất bại");
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại!"
      );
      console.error("Có lỗi xảy ra, vui lòng thử lại!:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  sendCodeResetPassword: async (credentials) => {
    set({ loading: true });
    try {
      const response = await sendCodeResetPasswordApi(credentials);
      if (response.message) {
        toast.success(response.message);
      } else {
        toast.error("Quên mật khẩu thất bại");
        console.error("Quên mật khẩu thất bại");
      }
    } catch (error) {
      toast.error((error as Error).message || "Có lỗi quên mật khẩu");
      console.error("Có lỗi quên mật khẩu:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (credentials) => {
    set({ loading: true });
    try {
      const response = await resetPasswordApi(credentials);
      if (response.message) {
        toast.success(response.message);
      } else {
        toast.error("Đặt lại mật khẩu thất bại");
        console.error("Đặt lại mật khẩu thất bại");
      }
    } catch (error) {
      toast.error((error as Error).message || "Đặt lại mật khẩu thất bại");
      console.error("Đặt lại mật khẩu thất bại:", error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  logout: () => {
    set({ user: null, isAuthenticated: false });
    localStorage.removeItem("auth_token");
  },

  getUser: async () => {
    set({ initializing: true });
    try {
      const user = await getUserApi();
      if (user) {
        set({ user: user.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("Failed to get user:", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ initializing: false });
    }
  },

  loginWithGoogle: async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
  },

  loginWithFacebook: async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`;
  },

  loginWithGithub: async () => {
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github`;
  },
}));
