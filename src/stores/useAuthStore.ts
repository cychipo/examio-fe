import { create } from "zustand";
import { User } from "@/types/user";
import {
  loginApi,
  signupApi,
  sendCodeResetPasswordApi,
  resetPasswordApi,
  loginWithGooglePopup,
  loginWithFacebookPopup,
  loginWithGithubPopup,
  CredentialsLogin,
  CredentialsSignup,
  SendCodeResetPassWordCredentials,
  ResetPasswordCredentials,
} from "@/apis/authApi";
import { LOCALSTORAGE_KEY } from "@/types/localstorage";
import { toast } from "@/components/ui/toast";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
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

  login: async (credentials) => {
    set({ loading: true });
    try {
      const response = await loginApi(credentials);
      if (response.token && response.user) {
        localStorage.setItem(
          LOCALSTORAGE_KEY.ACCESS_TOKEN,
          JSON.stringify(response.token)
        );
        localStorage.setItem(
          LOCALSTORAGE_KEY.USER,
          JSON.stringify(response.user)
        );
        set({ user: response.user, isAuthenticated: true });
        toast.success("Đăng nhập thành công");
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
        console.error(response.message || "Đăng nhập thất bại");
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
    localStorage.removeItem(LOCALSTORAGE_KEY.ACCESS_TOKEN);
    localStorage.removeItem(LOCALSTORAGE_KEY.USER);
    set({ user: null, isAuthenticated: false });
  },

  getUser: () => {
    const user = localStorage.getItem(LOCALSTORAGE_KEY.USER);
    const token = localStorage.getItem(LOCALSTORAGE_KEY.ACCESS_TOKEN);
    if (user && token) {
      set({ user: JSON.parse(user), isAuthenticated: true });
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  loginWithGoogle: async () => {
    set({ loading: true });
    try {
      const { token, user } = await loginWithGooglePopup();

      localStorage.setItem(LOCALSTORAGE_KEY.ACCESS_TOKEN, token);
      localStorage.setItem(LOCALSTORAGE_KEY.USER, JSON.stringify(user));
      set({ user, isAuthenticated: true });

      toast.success("Đăng nhập Google thành công");
    } catch (error) {
      toast.error("Đăng nhập Google thất bại");
      console.error("Đăng nhập Google thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },

  loginWithFacebook: async () => {
    set({ loading: true });
    try {
      const { token, user } = await loginWithFacebookPopup();

      localStorage.setItem(LOCALSTORAGE_KEY.ACCESS_TOKEN, token);
      localStorage.setItem(LOCALSTORAGE_KEY.USER, JSON.stringify(user));
      set({ user, isAuthenticated: true });

      toast.success("Đăng nhập Facebook thành công");
    } catch (error) {
      toast.error("Đăng nhập Facebook thất bại");
      console.error("Đăng nhập Facebook thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },

  loginWithGithub: async () => {
    set({ loading: true });
    try {
      const { token, user } = await loginWithGithubPopup();

      localStorage.setItem(LOCALSTORAGE_KEY.ACCESS_TOKEN, token);
      localStorage.setItem(LOCALSTORAGE_KEY.USER, JSON.stringify(user));
      set({ user, isAuthenticated: true });

      toast.success("Đăng nhập GitHub thành công");
    } catch (error) {
      toast.error("Đăng nhập GitHub thất bại");
      console.error("Đăng nhập GitHub thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },
}));
