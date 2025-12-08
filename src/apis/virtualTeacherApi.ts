import { api } from "./api";

export interface ChatRequest {
  message: string;
  documentId?: string;
}

export interface ChatResponse {
  success: boolean;
  response: string;
  error?: string;
}

export const virtualTeacherApi = {
  chat: async (request: ChatRequest): Promise<ChatResponse> => {
    const response = await api.post("/virtual-teacher/chat", request);
    return response.data;
  },

  uploadFile: async (
    file: File
  ): Promise<{ success: boolean; jobId: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/virtual-teacher/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
