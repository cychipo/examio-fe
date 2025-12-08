import { create } from "zustand";
import {
  aiChatApi,
  AIChat,
  AIChatMessage,
  SendMessageRequest,
} from "@/apis/aiChatApi";
import { toast } from "@/components/ui/toast";
import { RecentUpload } from "@/apis/aiApi";

// TTS Configuration
const TTS_CONFIG = {
  API_URL: "https://proxy.junookyo.workers.dev/",
  LANGUAGE: "vi-VN",
  SPEED: 1,
  MAX_CHUNK_LENGTH: 200,
};

interface AITeacherState {
  // Chat list
  chats: AIChat[];
  isLoadingChats: boolean;
  selectedChatId: string | null;

  // Current chat messages
  messages: AIChatMessage[];
  isLoadingMessages: boolean;

  // Input states
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;

  // File states
  selectedUpload: RecentUpload | null;
  uploadedImageUrl: string | null;
  isUploadingImage: boolean;
  isProcessingPdf: boolean;

  // TTS states
  currentAudio: HTMLAudioElement | null;
  audioQueue: string[];
  isPlayingQueue: boolean;

  // Actions - Chat CRUD
  fetchChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  selectChat: (chatId: string | null) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;

  // Actions - Messages
  sendMessage: (message: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Actions - Input
  setIsListening: (value: boolean) => void;
  setTranscript: (value: string) => void;

  // Actions - Files
  setSelectedUpload: (upload: RecentUpload | null) => void;
  setUploadedImageUrl: (url: string | null) => void;
  uploadImage: (file: File) => Promise<string | null>;

  // Actions - TTS
  speakResponse: (text: string) => void;
  stopSpeaking: () => void;
  setIsSpeaking: (value: boolean) => void;

  // Actions - Clear
  clearCurrentChat: () => void;
}

// Helper functions
const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    let breakPoint = maxLength;
    const sentenceEnd = remaining
      .substring(0, maxLength)
      .search(/[.!?][^.!?]*$/);
    if (sentenceEnd > 0) {
      breakPoint = sentenceEnd + 1;
    } else {
      const clauseEnd = remaining.substring(0, maxLength).search(/[,;][^,;]*$/);
      if (clauseEnd > 0) {
        breakPoint = clauseEnd + 1;
      } else {
        const lastSpace = remaining.substring(0, maxLength).lastIndexOf(" ");
        if (lastSpace > 0) {
          breakPoint = lastSpace;
        }
      }
    }

    chunks.push(remaining.substring(0, breakPoint).trim());
    remaining = remaining.substring(breakPoint).trim();
  }

  return chunks.filter((chunk) => chunk.length > 0);
};

const buildTTSUrl = (text: string): string => {
  const params = new URLSearchParams({
    language: TTS_CONFIG.LANGUAGE,
    text,
    speed: TTS_CONFIG.SPEED.toString(),
  });
  return `${TTS_CONFIG.API_URL}?${params.toString()}`;
};

export const useAITeacherStore = create<AITeacherState>((set, get) => ({
  // Initial states
  chats: [],
  isLoadingChats: false,
  selectedChatId: null,
  messages: [],
  isLoadingMessages: false,
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  transcript: "",
  selectedUpload: null,
  uploadedImageUrl: null,
  isUploadingImage: false,
  isProcessingPdf: false,
  currentAudio: null,
  audioQueue: [],
  isPlayingQueue: false,

  // ================== CHAT CRUD ==================

  fetchChats: async () => {
    set({ isLoadingChats: true });
    try {
      const response = await aiChatApi.getChats();
      set({ chats: response.chats });
    } catch (error) {
      console.error("Error fetching chats:", error);
      toast.error("Không thể tải danh sách chat");
    } finally {
      set({ isLoadingChats: false });
    }
  },

  createChat: async () => {
    try {
      const chat = await aiChatApi.createChat();
      // Optimistically add to list
      set((state) => ({
        chats: [chat, ...state.chats],
        selectedChatId: chat.id,
        messages: [],
      }));
      return chat.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Không thể tạo chat mới");
      return null;
    }
  },

  selectChat: async (chatId: string | null) => {
    if (chatId === null) {
      set({ selectedChatId: null, messages: [] });
      return;
    }

    set({ selectedChatId: chatId, isLoadingMessages: true });
    try {
      const messages = await aiChatApi.getChatMessages(chatId);
      set({ messages });
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  updateChatTitle: async (chatId: string, title: string) => {
    try {
      await aiChatApi.updateChat(chatId, { title });
      // Optimistically update
      set((state) => ({
        chats: state.chats.map((chat) =>
          chat.id === chatId ? { ...chat, title } : chat
        ),
      }));
      toast.success("Đã cập nhật tên chat");
    } catch (error) {
      console.error("Error updating chat:", error);
      toast.error("Không thể cập nhật tên chat");
    }
  },

  deleteChat: async (chatId: string) => {
    try {
      await aiChatApi.deleteChat(chatId);
      // Optimistically remove
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        selectedChatId:
          state.selectedChatId === chatId ? null : state.selectedChatId,
        messages: state.selectedChatId === chatId ? [] : state.messages,
      }));
      toast.success("Đã xóa chat");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Không thể xóa chat");
    }
  },

  // ================== MESSAGES ==================

  sendMessage: async (message: string) => {
    const {
      selectedChatId,
      selectedUpload,
      uploadedImageUrl,
      createChat,
      speakResponse,
      stopSpeaking,
    } = get();

    if (!message.trim()) return;

    stopSpeaking();

    let chatId = selectedChatId;
    // Create new chat if none selected
    if (!chatId) {
      chatId = await createChat();
      if (!chatId) return;
    }

    // Add user message optimistically
    const tempUserMsg: AIChatMessage = {
      id: `temp_user_${Date.now()}`,
      chatId,
      role: "user",
      content: message,
      imageUrl: uploadedImageUrl || undefined,
      documentId: selectedUpload?.id,
      documentName: selectedUpload?.filename,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      messages: [...state.messages, tempUserMsg],
      isProcessing: true,
      transcript: "",
      uploadedImageUrl: null,
    }));

    try {
      const request: SendMessageRequest = {
        message,
        imageUrl: uploadedImageUrl || undefined,
        documentId: selectedUpload?.id,
        documentName: selectedUpload?.filename,
      };

      const response = await aiChatApi.sendMessage(chatId, request);

      if (
        response.success &&
        response.userMessage &&
        response.assistantMessage
      ) {
        // Replace temp message with real one and add assistant message
        set((state) => ({
          messages: state.messages
            .filter((m) => m.id !== tempUserMsg.id)
            .concat([response.userMessage!, response.assistantMessage!]),
        }));

        // Update chat title if auto-generated
        if (response.chatTitle) {
          set((state) => ({
            chats: state.chats.map((chat) =>
              chat.id === chatId
                ? { ...chat, title: response.chatTitle! }
                : chat
            ),
          }));
        }

        // Speak the response
        speakResponse(response.assistantMessage.content);
      } else {
        // Add error message
        const errorMsg: AIChatMessage = {
          id: `error_${Date.now()}`,
          chatId,
          role: "assistant",
          content: response.error || "Có lỗi xảy ra. Vui lòng thử lại.",
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          messages: [...state.messages, errorMsg],
        }));
        toast.error(response.error || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      const errorMsg: AIChatMessage = {
        id: `error_${Date.now()}`,
        chatId,
        role: "assistant",
        content: "Không thể kết nối tới server.",
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        messages: [...state.messages, errorMsg],
      }));
      toast.error("Không thể kết nối tới server");
    } finally {
      set({ isProcessing: false });
    }
  },

  updateMessage: async (messageId: string, content: string) => {
    try {
      const updated = await aiChatApi.updateMessage(messageId, { content });
      set((state) => ({
        messages: state.messages.map((m) =>
          m.id === messageId ? { ...m, content: updated.content } : m
        ),
      }));
      toast.success("Đã cập nhật tin nhắn");
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error("Không thể cập nhật tin nhắn");
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      await aiChatApi.deleteMessage(messageId);
      set((state) => ({
        messages: state.messages.filter((m) => m.id !== messageId),
      }));
      toast.success("Đã xóa tin nhắn");
    } catch (error) {
      console.error("Error deleting message:", error);
      toast.error("Không thể xóa tin nhắn");
    }
  },

  // ================== INPUT ==================

  setIsListening: (value) => set({ isListening: value }),
  setTranscript: (value) => set({ transcript: value }),

  // ================== FILES ==================

  setSelectedUpload: (upload) => set({ selectedUpload: upload }),
  setUploadedImageUrl: (url) => set({ uploadedImageUrl: url }),

  uploadImage: async (file: File) => {
    set({ isUploadingImage: true });
    try {
      const response = await aiChatApi.uploadImage(file);
      set({ uploadedImageUrl: response.url });
      return response.url;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Không thể tải lên hình ảnh");
      return null;
    } finally {
      set({ isUploadingImage: false });
    }
  },

  // ================== TTS ==================

  setIsSpeaking: (value) => set({ isSpeaking: value }),

  speakResponse: (text: string) => {
    const { stopSpeaking, setIsSpeaking } = get();
    stopSpeaking();

    const chunks = splitTextIntoChunks(text, TTS_CONFIG.MAX_CHUNK_LENGTH);
    if (chunks.length === 0) return;

    const audioUrls = chunks.map((chunk) => buildTTSUrl(chunk));
    const preloadedAudios: Map<number, HTMLAudioElement> = new Map();

    const preloadAudio = (index: number): HTMLAudioElement | null => {
      if (index >= audioUrls.length) return null;
      if (preloadedAudios.has(index)) return preloadedAudios.get(index)!;

      const audio = new Audio();
      audio.preload = "auto";
      audio.src = audioUrls[index];
      preloadedAudios.set(index, audio);
      return audio;
    };

    for (let i = 0; i < Math.min(3, audioUrls.length); i++) {
      preloadAudio(i);
    }

    set({ audioQueue: audioUrls, isPlayingQueue: true });
    setIsSpeaking(true);

    const playNextChunk = (index: number) => {
      const state = get();
      if (!state.isPlayingQueue || index >= audioUrls.length) {
        set({ isSpeaking: false, isPlayingQueue: false, currentAudio: null });
        preloadedAudios.clear();
        return;
      }

      const audio = preloadedAudios.get(index) || new Audio(audioUrls[index]);
      set({ currentAudio: audio });

      const nextIndex = index + 1;
      if (nextIndex < audioUrls.length) {
        preloadAudio(nextIndex);
        if (nextIndex + 1 < audioUrls.length) preloadAudio(nextIndex + 1);
      }

      audio.onended = () => playNextChunk(index + 1);
      audio.onerror = () => playNextChunk(index + 1);
      audio.play().catch(() => playNextChunk(index + 1));
    };

    playNextChunk(0);
  },

  stopSpeaking: () => {
    const { currentAudio } = get();
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = "";
    }
    set({
      isSpeaking: false,
      isPlayingQueue: false,
      currentAudio: null,
      audioQueue: [],
    });
  },

  // ================== CLEAR ==================

  clearCurrentChat: () => {
    set({ messages: [], selectedChatId: null });
  },
}));
