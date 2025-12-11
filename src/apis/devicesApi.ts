import { api } from "./api";

export interface Device {
  id: string;
  deviceId: string;
  deviceName: string | null;
  browser: string | null;
  os: string | null;
  location: string;
  ipAddress: string | null;
  lastActivity: string;
  loginTime: string;
  isCurrent: boolean;
}

export interface GetDevicesResponse {
  devices: Device[];
}

export interface LogoutDeviceResponse {
  success: boolean;
  message: string;
}

export interface LogoutAllOthersResponse {
  success: boolean;
  message: string;
  devicesLoggedOut: number;
}

/**
 * Get list of logged-in devices for the current user
 */
export async function getDevicesApi(): Promise<GetDevicesResponse> {
  const response = await api.get("/devices");
  return response.data;
}

/**
 * Logout a specific device by session ID
 */
export async function logoutDeviceApi(
  sessionId: string
): Promise<LogoutDeviceResponse> {
  const response = await api.delete(`/devices/${sessionId}`);
  return response.data;
}

/**
 * Logout all other devices except the current one
 */
export async function logoutAllOthersApi(): Promise<LogoutAllOthersResponse> {
  const response = await api.post("/devices/logout-all-others");
  return response.data;
}
