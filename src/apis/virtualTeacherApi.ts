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
};
