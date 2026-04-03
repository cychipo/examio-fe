import { create } from "zustand";
import { User, UserRole } from "@/types/user";
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
  refreshTokenApi,
  LoginResponse,
  SignupResponse,
} from "@/apis/authApi";
import { toast } from "@/components/ui/toast";
import {
  setAuthToken,
  clearAuthToken,
  setStoredRefreshToken,
  clearStoredRefreshToken,
  setStoredSessionId,
  clearStoredSessionId,
} from "@/hooks/useAuthSync";
import { clearRedirectBackTarget, getRedirectBackTarget } from "@/lib/authRedirect";
import { env } from "@/lib/env";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean; // Track initial user check to prevent flash
  login: (credentials: CredentialsLogin) => Promise<LoginResponse>;
  signup: (credentials: CredentialsSignup) => Promise<SignupResponse>;
  sendCodeResetPassword: (
    credentials: SendCodeResetPassWordCredentials,
  ) => Promise<void>;
  resetPassword: (credentials: ResetPasswordCredentials) => Promise<void>;
  logout: () => Promise<void>;
  getUser: () => void;
  refreshSession: () => Promise<string | null>;
  sendVerificationEmail: () => Promise<void>;
  verifyAccount: (code: string) => Promise<void>;
  loginWithGoogle?: (role: UserRole) => Promise<void>;
  loginWithFacebook?: (role: UserRole) => Promise<void>;
  loginWithGithub?: (role: UserRole) => Promise<void>;
  updateWalletBalance: (newBalance: number) => void;
}

function getOAuthRedirectPath() {
  const currentPath =
    typeof window !== "undefined" ? window.location.pathname : "/k";
  const searchParams =
    typeof window !== "undefined" ? window.location.search : "";
  const urlParams = new URLSearchParams(searchParams);

  const fromParam = urlParams.get("from");

  if (fromParam) {
    return fromParam;
  }

  const authPaths = ["/login", "/register", "/forgot-password", "/reset-password"];

  if (authPaths.some((path) => currentPath.startsWith(path))) {
    return "/k";
  }

  return currentPath;
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

        if (response.token && typeof window !== "undefined") {
          setAuthToken(response.token);
        }
        if (response.refreshToken && typeof window !== "undefined") {
          setStoredRefreshToken(response.refreshToken);
        }
        if (response.sessionId && typeof window !== "undefined") {
          setStoredSessionId(response.sessionId);
        }

        const redirectTo = getRedirectBackTarget();
        clearRedirectBackTarget();

        return {
          ...response,
          redirectTo,
        } as typeof response & { redirectTo: string };
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
        set({
          user: response.user,
          isAuthenticated: true,
          initializing: false,
        });
        toast.success(response.message || "Đăng ký thành công");

        if (response.token && typeof window !== "undefined") {
          setAuthToken(response.token);
        }
        if (response.refreshToken && typeof window !== "undefined") {
          setStoredRefreshToken(response.refreshToken);
        }
        if (response.sessionId && typeof window !== "undefined") {
          setStoredSessionId(response.sessionId);
        }

        const redirectTo = getRedirectBackTarget();
        clearRedirectBackTarget();

        return {
          ...response,
          redirectTo,
        } as typeof response & { redirectTo: string };
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
    clearStoredRefreshToken();
    clearStoredSessionId();
  },

  refreshSession: async () => {
    try {
      const response = await refreshTokenApi();

      if (!response.success || !response.token) {
        throw new Error(response.message || "Làm mới phiên đăng nhập thất bại");
      }

      if (typeof window !== "undefined") {
        setAuthToken(response.token);
        if (response.refreshToken) {
          setStoredRefreshToken(response.refreshToken);
        }
      }

      set((state) => ({
        user: response.user ?? state.user,
        isAuthenticated: true,
      }));

      return response.token;
    } catch (error) {
      set({ user: null, isAuthenticated: false });
      clearAuthToken();
      clearStoredRefreshToken();
      clearStoredSessionId();
      throw error;
    }
  },

  getUser: async () => {
    if (typeof window !== "undefined" && !localStorage.getItem("auth_token")) {
      console.warn("[auth-store] skip getUser because auth_token is missing");
      set({ user: null, isAuthenticated: false, initializing: false });
      return;
    }

    console.log("[auth-store] getUser start", {
      authToken: typeof window !== "undefined" ? localStorage.getItem("auth_token") : null,
      refreshToken: typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null,
      sessionId: typeof window !== "undefined" ? localStorage.getItem("session_id") : null,
    });

    set((state) => ({
      initializing: !state.isAuthenticated,
    }));
    try {
      const user = await getUserApi(true);
      if (user) {
        console.log("[auth-store] getUser success", user);
        set({ user: user.user, isAuthenticated: true });
      } else {
        console.warn("[auth-store] getUser returned empty payload");
        set({ user: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error("[auth-store] getUser failed", error);
      set({ user: null, isAuthenticated: false });
    } finally {
      console.log("[auth-store] getUser finished");
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

  loginWithGoogle: async (role) => {
    const redirectPath = getOAuthRedirectPath();
    const redirect = encodeURIComponent(redirectPath);
    window.location.href = `${env.apiUrl}/auth/google?role=${role}&redirect=${redirect}`;
  },

  loginWithFacebook: async (role) => {
    const redirectPath = getOAuthRedirectPath();
    const redirect = encodeURIComponent(redirectPath);
    window.location.href = `${env.apiUrl}/auth/facebook?role=${role}&redirect=${redirect}`;
  },

  loginWithGithub: async (role) => {
    const redirectPath = getOAuthRedirectPath();
    const redirect = encodeURIComponent(redirectPath);
    window.location.href = `${env.apiUrl}/auth/github?role=${role}&redirect=${redirect}`;
  },
}));
