import { api } from "./api";

// ================== TYPES ==================

export interface AIChat {
  id: string;
  userId: string;
  title: string;
  activeDocumentId?: string | null;
  activeDocumentName?: string | null;
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
  documentIds?: string[];
  documentName?: string;
  modelType?: string; // 'gemini' or 'fayedark'
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

  // ================== MULTI-DOCUMENT ==================

  /**
   * Add a document to chat
   */
  addDocument: async (
    chatId: string,
    documentId: string,
    documentName: string
  ): Promise<{ id: string; documentId: string; documentName: string }> => {
    const response = await api.post(`/ai-chat/${chatId}/documents`, {
      documentId,
      documentName,
    });
    return response.data;
  },

  /**
   * Remove a document from chat
   */
  removeDocument: async (
    chatId: string,
    documentId: string
  ): Promise<{ success: boolean }> => {
    const response = await api.delete(
      `/ai-chat/${chatId}/documents/${documentId}`
    );
    return response.data;
  },

  /**
   * Get all documents for a chat
   */
  getDocuments: async (
    chatId: string
  ): Promise<Array<{ documentId: string; documentName: string }>> => {
    const response = await api.get(`/ai-chat/${chatId}/documents`);
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
   * Regenerate AI response from a specific message
   */
  regenerateFromMessage: async (
    messageId: string
  ): Promise<SendMessageResponse> => {
    const response = await api.post(`/ai-chat/message/${messageId}/regenerate`);
    return response.data;
  },

  /**
   * Check if chat exists
   */
  chatExists: async (chatId: string): Promise<{ exists: boolean }> => {
    const response = await api.get(`/ai-chat/${chatId}/exists`);
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

  /**
   * Stream a message and receive chunks via SSE
   */
  streamMessage: (
    chatId: string,
    data: SendMessageRequest,
    onChunk: (chunk: string) => void,
    onUserMessage: (message: AIChatMessage) => void,
    onComplete: (
      assistantMessage: AIChatMessage | null,
      isNewChat: boolean
    ) => void,
    onError: (error: string) => void
  ): (() => void) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const controller = new AbortController();

    fetch(`${baseUrl}/ai-chat/${chatId}/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          onError(errorData.message || "Có lỗi xảy ra khi kết nối");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError("Không thể đọc response stream");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === "user_message") {
                  onUserMessage(event.data);
                } else if (event.type === "chunk") {
                  onChunk(event.data);
                } else if (event.type === "done") {
                  onComplete(
                    event.data.assistantMessage,
                    event.data.isNewChat || false
                  );
                } else if (event.type === "error") {
                  onError(event.data);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error.message || "Lỗi kết nối");
        }
      });

    return () => controller.abort();
  },

  /**
   * Stream regenerate response via SSE
   */
  streamRegenerate: (
    messageId: string,
    onChunk: (chunk: string) => void,
    onMessagesDeleted: (chatId: string, userMessage: AIChatMessage) => void,
    onComplete: (assistantMessage: AIChatMessage | null) => void,
    onError: (error: string) => void
  ): (() => void) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const controller = new AbortController();

    fetch(`${baseUrl}/ai-chat/message/${messageId}/regenerate-stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          onError(errorData.message || "Có lỗi xảy ra");
          return;
        }

        const reader = response.body?.getReader();
        if (!reader) {
          onError("Không thể đọc response stream");
          return;
        }

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                if (event.type === "messages_deleted") {
                  onMessagesDeleted(event.data.chatId, event.data.userMessage);
                } else if (event.type === "chunk") {
                  onChunk(event.data);
                } else if (event.type === "done") {
                  onComplete(event.data.assistantMessage);
                } else if (event.type === "error") {
                  onError(event.data);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          onError(error.message || "Lỗi kết nối");
        }
      });

    return () => controller.abort();
  },
};
