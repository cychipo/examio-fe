import { api } from "./api";

// ================== TYPES ==================

export interface AIChat {
  id: string;
  userId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
  messageCount?: number;
}

export interface AIChatMessage {
  id: string;
  chatId: string;
  role: "user" | "assistant";
  content: string;
  imageUrl?: string;
  documentId?: string;
  documentName?: string;
  createdAt: string;
}

export interface ChatListResponse {
  chats: AIChat[];
  total: number;
}

export interface SendMessageRequest {
  message: string;
  imageUrl?: string;
  documentId?: string;
  documentName?: string;
}

export interface SendMessageResponse {
  success: boolean;
  userMessage?: AIChatMessage;
  assistantMessage?: AIChatMessage;
  error?: string;
  chatTitle?: string;
}

export interface CreateChatRequest {
  title?: string;
}

export interface UpdateChatRequest {
  title: string;
}

export interface UpdateMessageRequest {
  content: string;
}

// ================== API ==================

export const aiChatApi = {
  /**
   * Get all chats for current user
   */
  getChats: async (): Promise<ChatListResponse> => {
    const response = await api.get("/ai-chat");
    return response.data;
  },

  /**
   * Get messages for a specific chat
   */
  getChatMessages: async (chatId: string): Promise<AIChatMessage[]> => {
    const response = await api.get(`/ai-chat/${chatId}/messages`);
    return response.data;
  },

  /**
   * Create a new chat
   */
  createChat: async (data?: CreateChatRequest): Promise<AIChat> => {
    const response = await api.post("/ai-chat", data || {});
    return response.data;
  },

  /**
   * Send a message to a chat and get AI response
   */
  sendMessage: async (
    chatId: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await api.post(`/ai-chat/${chatId}/message`, data);
    return response.data;
  },

  /**
   * Update chat title
   */
  updateChat: async (
    chatId: string,
    data: UpdateChatRequest
  ): Promise<AIChat> => {
    const response = await api.patch(`/ai-chat/${chatId}`, data);
    return response.data;
  },

  /**
   * Delete a chat
   */
  deleteChat: async (
    chatId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/ai-chat/${chatId}`);
    return response.data;
  },

  /**
   * Update a message
   */
  updateMessage: async (
    messageId: string,
    data: UpdateMessageRequest
  ): Promise<AIChatMessage> => {
    const response = await api.patch(`/ai-chat/message/${messageId}`, data);
    return response.data;
  },

  /**
   * Delete a message
   */
  deleteMessage: async (
    messageId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/ai-chat/message/${messageId}`);
    return response.data;
  },

  /**
   * Upload image to R2 and return URL
   */
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await api.post("/ai/upload-image", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },
};
