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
  sendVerificationEmailApi,
  verifyAccountApi,
  logoutApi,
} from "@/apis/authApi";
import { toast } from "@/components/ui/toast";
import { setAuthToken, clearAuthToken } from "@/hooks/useAuthSync";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean; // Track initial user check to prevent flash
  login: (credentials: CredentialsLogin) => Promise<void>;
  signup: (credentials: CredentialsSignup) => Promise<void>;
  sendCodeResetPassword: (
    credentials: SendCodeResetPassWordCredentials,
  ) => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => void;
  sendVerificationEmail: () => Promise<void>;
  verifyAccount: (code: string) => Promise<void>;
  loginWithGoogle?: () => Promise<void>;
  loginWithFacebook?: () => Promise<void>;
  loginWithGithub?: () => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
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
        set({
          user: response.user,
          isAuthenticated: true,
          initializing: false,
        });
        toast.success("Đăng nhập thành công");

        // Set token to both localStorage and cookie
        if (response.token && typeof window !== "undefined") {
          setAuthToken(response.token);
        }

        return Promise.resolve(); // Resolve successfully
      } else {
        toast.error(response.message || "Đăng nhập thất bại");
        console.error(response.message || "Đăng nhập thất bại");
        return Promise.reject(
          new Error(response.message || "Đăng nhập thất bại"),
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
      if (response.success && response.token) {
        // Auto-login after successful registration
        set({
          user: response.user,
          isAuthenticated: true,
          initializing: false,
        });
        toast.success(response.message || "Đăng ký thành công");

        // Set token to both localStorage and cookie
        if (response.token && typeof window !== "undefined") {
          setAuthToken(response.token);
        }

        return Promise.resolve(); // Resolve successfully for redirect
      } else {
        toast.error(response.message || "Đăng ký tài khoản thất bại");
        console.error("Đăng ký tài khoản thất bại");
        return Promise.reject(
          new Error(response.message || "Đăng ký tài khoản thất bại"),
        );
      }
    } catch (error) {
      toast.error(
        (error as Error).message || "Có lỗi xảy ra, vui lòng thử lại!",
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

  logout: async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error("Logout API error:", error);
    }
    set({ user: null, isAuthenticated: false });
    clearAuthToken();
  },

  getUser: async () => {
    set({ initializing: true });
    try {
      const user = await getUserApi(true);
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

  sendVerificationEmail: async () => {
    set({ loading: true });
    try {
      const response = await sendVerificationEmailApi();
      if (response.message) {
        toast.success(response.message);
      }
    } catch (error) {
      toast.error((error as Error).message || "Gửi email xác minh thất bại");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  updateWalletBalance: (newBalance: number) => {
    set((state) => {
      if (state.user && state.user.wallet) {
        return {
          user: {
            ...state.user,
            wallet: {
              ...state.user.wallet,
              balance: newBalance,
            },
          },
        };
      }
      return state;
    });
  },

  verifyAccount: async (code: string) => {
    set({ loading: true });
    try {
      const response = await verifyAccountApi(code);
      if (response.message) {
        toast.success(response.message);
        // Refresh user data to update isVerified status
        const userData = await getUserApi(true);
        if (userData) {
          set({ user: userData.user });
        }
      }
    } catch (error) {
      toast.error((error as Error).message || "Xác minh tài khoản thất bại");
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loginWithGoogle: async () => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/k";
    const searchParams =
      typeof window !== "undefined" ? window.location.search : "";
    // Try to get 'from' param from current URL (if on login page), otherwise use current path
    const urlParams = new URLSearchParams(searchParams);
    const redirectPath = urlParams.get("from") || currentPath;
    const redirectParam = encodeURIComponent(redirectPath);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?redirect=${redirectParam}`;
  },

  loginWithFacebook: async () => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/k";
    const searchParams =
      typeof window !== "undefined" ? window.location.search : "";
    const urlParams = new URLSearchParams(searchParams);
    const redirectPath = urlParams.get("from") || currentPath;
    const redirectParam = encodeURIComponent(redirectPath);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook?redirect=${redirectParam}`;
  },

  loginWithGithub: async () => {
    const currentPath =
      typeof window !== "undefined" ? window.location.pathname : "/k";
    const searchParams =
      typeof window !== "undefined" ? window.location.search : "";
    const urlParams = new URLSearchParams(searchParams);
    const redirectPath = urlParams.get("from") || currentPath;
    const redirectParam = encodeURIComponent(redirectPath);
    window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/github?redirect=${redirectParam}`;
  },
}));
