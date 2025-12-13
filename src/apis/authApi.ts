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
  token?: string;
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

export async function loginApi(
  credentials: CredentialsLogin
): Promise<LoginResponse> {
  const response = await api.post("/auth/login", credentials);
  return response.data;
}

export async function signupApi(
  credentials: CredentialsSignup
): Promise<SignupResponse> {
  const response = await api.post("/auth/register", credentials);
  return response.data;
}

export async function sendCodeResetPasswordApi(
  credentials: SendCodeResetPassWordCredentials
): Promise<SendCodeResetPassWordResponse> {
  const response = await api.post(
    "/auth/send-code-reset-password",
    credentials
  );
  return response.data;
}

export async function resetPasswordApi(
  credentials: ResetPasswordCredentials
): Promise<ResetPasswordResponse> {
  const response = await api.post("/auth/reset-password", credentials);
  return response.data;
}

export async function getUserApi(): Promise<{ user: User }> {
  const response = await api.get("/auth/me");
  return response.data;
}

export interface VerifyAccountResponse {
  message: string;
}

export async function sendVerificationEmailApi(): Promise<{ message: string }> {
  const response = await api.post("/auth/sendVerificationEmail");
  return response.data;
}

export async function verifyAccountApi(
  code: string
): Promise<VerifyAccountResponse> {
  const response = await api.post("/auth/verifyAccount", { code });
  return response.data;
}

export async function logoutApi(): Promise<{ success: boolean }> {
  const response = await api.post("/auth/logout");
  return response.data;
}

// ==================== Change Password (Authenticated) ====================

export interface ChangePasswordCredentials {
  code: string;
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export async function sendCodeChangePasswordApi(): Promise<{
  message: string;
}> {
  const response = await api.post("/auth/send-code-change-password");
  return response.data;
}

export async function changePasswordApi(
  credentials: ChangePasswordCredentials
): Promise<ChangePasswordResponse> {
  const response = await api.post("/auth/change-password", credentials);
  return response.data;
}
