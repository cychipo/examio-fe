import { api } from "./api";
import { User } from "@/types/user";

export interface CredentialsLogin {
  credential: string; // can be email or username or phone
  password: string;
}

export interface CredentialsSignup {
  username: string;
  password: string;
  email: string;
}

export interface LoginResponse {
  token?: string;
  user?: User;
  message?: string;
}

export interface SignupResponse {
  message: string;
  user: User;
}

export interface SendCodeResetPassWordCredentials {
  email: string;
}

export interface SendCodeResetPassWordResponse {
  message: string;
}

export interface ResetPasswordCredentials {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export const loginApi = async (
  credentials: CredentialsLogin
): Promise<LoginResponse> => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

export const signupApi = async (
  credentials: CredentialsSignup
): Promise<SignupResponse> => {
  const response = await api.post("/auth/register", credentials);
  return response.data;
};

export const sendCodeResetPasswordApi = async (
  credentials: SendCodeResetPassWordCredentials
): Promise<SendCodeResetPassWordResponse> => {
  const response = await api.post(
    "/auth/send-code-reset-password",
    credentials
  );
  return response.data;
};

export const resetPasswordApi = async (
  credentials: ResetPasswordCredentials
): Promise<ResetPasswordResponse> => {
  const response = await api.post("/auth/reset-password", credentials);
  return response.data;
};

export const loginWithGooglePopup = (): Promise<{
  token: string;
  user: User;
}> => {
  return new Promise((resolve, reject) => {
    const width = 500;
    const height = 600;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;

    const popup = window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/google`,
      "GoogleLogin",
      `width=${width},height=${height},top=${top},left=${left}`
    );

    if (!popup) {
      return reject(new Error("Không thể mở popup"));
    }

    const messageHandler = (event: MessageEvent) => {
      const { token, user } = event.data;
      console.log("User", user);
      if (token && user) {
        resolve({ token, user });
      } else {
        reject(new Error("Không nhận được token/user"));
      }

      window.removeEventListener("message", messageHandler);
    };

    window.addEventListener("message", messageHandler);
  });
};

export const loginWithFacebookPopup = (): Promise<{
  token: string;
  user: User;
}> => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/facebook`,
      "_blank",
      "width=500,height=600"
    );

    if (!popup) {
      return reject(new Error("Không thể mở popup"));
    }

    const listener = (event: MessageEvent) => {
      if (event.data.token) {
        resolve(event.data);
        window.removeEventListener("message", listener);
      } else {
        reject(new Error("Đăng nhập thất bại"));
      }
    };

    window.addEventListener("message", listener);
  });
};

export const loginWithGithubPopup = (): Promise<{
  token: string;
  user: User;
}> => {
  return new Promise((resolve, reject) => {
    const popup = window.open(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/github`,
      "_blank",
      "width=500,height=600"
    );

    if (!popup) {
      return reject(new Error("Không thể mở popup"));
    }

    const listener = (event: MessageEvent) => {
      if (event.data.token) {
        resolve(event.data);
        window.removeEventListener("message", listener);
      } else {
        reject(new Error("Đăng nhập thất bại"));
      }
    };

    window.addEventListener("message", listener);
  });
};
