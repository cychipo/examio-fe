/**
 * Device ID management for session tracking
 * The device ID is stored in localStorage and sent with every request
 */

export function getOrCreateDeviceId(): string {
  if (typeof window === "undefined") return "";

  let deviceId = localStorage.getItem("device_id");

  if (!deviceId) {
    // Generate a random device ID
    deviceId = crypto.randomUUID();
    localStorage.setItem("device_id", deviceId);
  }

  return deviceId;
}

export function clearDeviceId(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("device_id");
}
