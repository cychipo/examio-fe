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
  success: boolean;
  message?: string;
  user?: User;
}

export interface SignupResponse {
  success: boolean;
  message: string;
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
