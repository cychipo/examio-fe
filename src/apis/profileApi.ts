import { api } from "./api";

// ==================== Types ====================

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  name: string | null;
  avatar: string | null;
  banner: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfileData {
  name?: string;
  bio?: string;
  avatar?: string | null;
  banner?: string | null;
}

export interface UploadImageResponse {
  url: string;
}

// ==================== API Functions ====================

/**
 * Get current user profile - uses backend cache
 */
export async function getProfileApi(): Promise<UserProfile> {
  const response = await api.get("/profile");
  return response.data;
}

/**
 * Update user profile - invalidates cache
 */
export async function updateProfileApi(
  data: UpdateProfileData
): Promise<UserProfile> {
  const response = await api.put("/profile", data);
  return response.data;
}

/**
 * Upload avatar image to R2
 */
export async function uploadAvatarApi(
  file: File
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/profile/upload-avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * Upload banner image to R2
 */
export async function uploadBannerApi(
  file: File
): Promise<UploadImageResponse> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/profile/upload-banner", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}
