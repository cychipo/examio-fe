import { api } from "./api";

export interface UploadImageResponse {
  url: string;
}

export const mediaApi = {
  /**
   * Upload image to R2 storage
   * @param file - Image file (max 2MB)
   * @returns Public URL of uploaded image
   */
  uploadImage: async (file: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/r2/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },
};
