import { create } from "zustand";
import {
  aiChatApi,
  AIChat,
  AIChatMessage,
  SendMessageRequest,
} from "@/apis/aiChatApi";
import { toast } from "@/components/ui/toast";
import { RecentUpload, aiApi } from "@/apis/aiApi";
import { virtualTeacherApi } from "@/apis/virtualTeacherApi";

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

  // Streaming state
  streamingContent: string;
  isStreaming: boolean;

  // Input states
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  isRegenerating: boolean;
  transcript: string;
  usedMicForLastMessage: boolean;

  // File states
  selectedUploads: RecentUpload[];
  uploadedImageUrl: string | null;
  isUploadingImage: boolean;
  isProcessingPdf: boolean;

  // TTS states
  currentAudio: HTMLAudioElement | null;
  audioQueue: string[];
  isPlayingQueue: boolean;

  // Stream abort function
  abortStream: (() => void) | null;

  // Actions - Chat CRUD
  fetchChats: () => Promise<void>;
  createChat: () => Promise<string | null>;
  selectChat: (chatId: string | null, updateUrl?: boolean) => Promise<void>;
  updateChatTitle: (chatId: string, title: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  checkAndLoadChatFromUrl: () => Promise<void>;

  // Actions - Messages (now with streaming)
  sendMessage: (message: string, fromMic?: boolean) => Promise<void>;
  regenerateFromMessage: (messageId: string) => Promise<void>;
  updateMessage: (messageId: string, content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;

  // Actions - Input
  setIsListening: (value: boolean) => void;
  setTranscript: (value: string) => void;

  // Actions - Files
  setSelectedUploads: (uploads: RecentUpload[]) => void;
  addSelectedUpload: (upload: RecentUpload) => void;
  removeSelectedUpload: (uploadId: string) => void;
  setUploadedImageUrl: (url: string | null) => void;
  uploadImage: (file: File) => Promise<string | null>;
  uploadPdf: (files: File[]) => Promise<void>;

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

// URL Query helpers
const updateUrlQuery = (chatId: string | null) => {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (chatId) {
    url.searchParams.set("chat_id", chatId);
  } else {
    url.searchParams.delete("chat_id");
  }
  window.history.replaceState({}, "", url.toString());
};

const getChatIdFromUrl = (): string | null => {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  return url.searchParams.get("chat_id");
};

export const useAITeacherStore = create<AITeacherState>((set, get) => ({
  // Initial states
  chats: [],
  isLoadingChats: false,
  selectedChatId: null,
  messages: [],
  isLoadingMessages: false,
  streamingContent: "",
  isStreaming: false,
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  isRegenerating: false,
  transcript: "",
  usedMicForLastMessage: false,
  selectedUploads: [],
  uploadedImageUrl: null,
  isUploadingImage: false,
  isProcessingPdf: false,
  currentAudio: null,
  audioQueue: [],
  isPlayingQueue: false,
  abortStream: null,

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
      const existingChat = get().chats.find((c) => c.id === chat.id);
      if (existingChat) {
        get().selectChat(chat.id, true);
        return chat.id;
      }
      set((state) => ({
        chats: [chat, ...state.chats],
        selectedChatId: chat.id,
        messages: [],
      }));
      updateUrlQuery(chat.id);
      return chat.id;
    } catch (error) {
      console.error("Error creating chat:", error);
      toast.error("Không thể tạo chat mới");
      return null;
    }
  },

  selectChat: async (chatId: string | null, updateUrl = true) => {
    // Abort any ongoing stream
    const { abortStream } = get();
    if (abortStream) {
      abortStream();
      set({ abortStream: null, isStreaming: false, streamingContent: "" });
    }

    if (chatId === null) {
      set({ selectedChatId: null, messages: [] });
      if (updateUrl) updateUrlQuery(null);
      return;
    }

    set({ selectedChatId: chatId, isLoadingMessages: true });
    if (updateUrl) updateUrlQuery(chatId);

    // Clear file selection when switching chats
    set({ selectedUploads: [], uploadedImageUrl: null });

    try {
      const messages = await aiChatApi.getChatMessages(chatId);
      set({ messages });

      // Load chat's linked documents from server (O(1) via index)
      const docs = await aiChatApi.getDocuments(chatId);
      if (docs.length > 0) {
        set({
          selectedUploads: docs.map((d) => ({
            id: d.documentId,
            filename: d.documentName,
            url: "",
            size: 0,
            mimeType: "application/pdf",
            createdAt: new Date().toISOString(),
            quizHistory: null,
            flashcardHistory: null,
          })),
        });
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast.error("Không thể tải tin nhắn");
    } finally {
      set({ isLoadingMessages: false });
    }
  },

  checkAndLoadChatFromUrl: async () => {
    const chatIdFromUrl = getChatIdFromUrl();
    if (!chatIdFromUrl) return;

    try {
      const { exists } = await aiChatApi.chatExists(chatIdFromUrl);
      if (exists) {
        await get().selectChat(chatIdFromUrl, false);
      } else {
        updateUrlQuery(null);
      }
    } catch {
      updateUrlQuery(null);
    }
  },

  updateChatTitle: async (chatId: string, title: string) => {
    try {
      await aiChatApi.updateChat(chatId, { title });
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
      const { selectedChatId } = get();
      set((state) => ({
        chats: state.chats.filter((chat) => chat.id !== chatId),
        selectedChatId: selectedChatId === chatId ? null : selectedChatId,
        messages: selectedChatId === chatId ? [] : state.messages,
      }));
      if (selectedChatId === chatId) {
        updateUrlQuery(null);
      }
      toast.success("Đã xóa chat");
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Không thể xóa chat");
    }
  },

  // ================== MESSAGES WITH STREAMING ==================

  sendMessage: async (message: string, fromMic = false) => {
    const {
      selectedChatId,
      selectedUploads,
      uploadedImageUrl,
      createChat,
      speakResponse,
      stopSpeaking,
      abortStream,
    } = get();

    if (!message.trim()) return;

    // Abort any previous stream
    if (abortStream) {
      abortStream();
    }

    stopSpeaking();
    set({ usedMicForLastMessage: fromMic });

    let chatId = selectedChatId;
    if (!chatId) {
      chatId = await createChat();
      if (!chatId) return;
    }

    // Sync documents to server before sending message
    // Filter out placeholders and sync real documents
    const realDocs = selectedUploads.filter(
      (u) => !u.id.startsWith("processing-")
    );
    for (const doc of realDocs) {
      try {
        await aiChatApi.addDocument(chatId, doc.id, doc.filename);
      } catch (err) {
        console.error("Error syncing document:", err);
      }
    }

    set({
      isProcessing: true,
      isStreaming: true,
      streamingContent: "",
      transcript: "",
      uploadedImageUrl: null,
      selectedUploads: [], // Clear files after syncing
    });

    const request: SendMessageRequest = {
      message,
      imageUrl: uploadedImageUrl || undefined,
      documentIds: realDocs.length > 0 ? realDocs.map((d) => d.id) : undefined,
      documentId: realDocs.length > 0 ? realDocs[0].id : undefined, // Legacy
      documentName: realDocs.length > 0 ? realDocs[0].filename : undefined, // Legacy
    };

    const abort = aiChatApi.streamMessage(
      chatId,
      request,
      // onChunk
      (chunk: string) => {
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
        }));
      },
      // onUserMessage
      (userMessage: AIChatMessage) => {
        set((state) => ({
          messages: [...state.messages, userMessage],
        }));
      },
      // onComplete
      (assistantMessage: AIChatMessage | null, isNewChat: boolean) => {
        if (assistantMessage) {
          // First add the message to the list
          set((state) => {
            return {
              messages: [...state.messages, assistantMessage],
            };
          });

          // Then clear streaming state after a longer delay to ensure React renders
          setTimeout(() => {
            set({
              isProcessing: false,
              isStreaming: false,
              streamingContent: "",
              abortStream: null,
            });
          }, 200);

          // Auto-speak if from mic
          if (fromMic) {
            speakResponse(assistantMessage.content);
          }

          // Refresh chat list if title was updated
          if (isNewChat) {
            get().fetchChats();
          }
        } else {
          set({
            isProcessing: false,
            isStreaming: false,
            streamingContent: "",
            abortStream: null,
          });
        }
      },
      // onError
      (error: string) => {
        set({
          isProcessing: false,
          isStreaming: false,
          streamingContent: "",
          abortStream: null,
        });
        toast.error(error);
      }
    );

    set({ abortStream: abort });
  },

  regenerateFromMessage: async (messageId: string) => {
    const { stopSpeaking, abortStream } = get();

    if (abortStream) {
      abortStream();
    }

    stopSpeaking();
    set({
      isRegenerating: true,
      isStreaming: true,
      streamingContent: "",
    });

    const abort = aiChatApi.streamRegenerate(
      messageId,
      // onChunk
      (chunk: string) => {
        set((state) => ({
          streamingContent: state.streamingContent + chunk,
        }));
      },
      // onMessagesDeleted
      (chatId: string, userMessage: AIChatMessage) => {
        // Remove all messages after the user message
        set((state) => {
          const userMsgIndex = state.messages.findIndex(
            (m) => m.id === userMessage.id
          );
          if (userMsgIndex >= 0) {
            return {
              messages: state.messages.slice(0, userMsgIndex + 1),
            };
          }
          return state;
        });
      },
      // onComplete
      (assistantMessage: AIChatMessage | null) => {
        if (assistantMessage) {
          // First add the message
          set((state) => ({
            messages: [...state.messages, assistantMessage],
          }));

          // Then clear streaming state after delay
          setTimeout(() => {
            set({
              isRegenerating: false,
              isStreaming: false,
              streamingContent: "",
              abortStream: null,
            });
          }, 50);

          toast.success("Đã tạo lại câu trả lời");
        } else {
          set({
            isRegenerating: false,
            isStreaming: false,
            streamingContent: "",
            abortStream: null,
          });
        }
      },
      // onError
      (error: string) => {
        set({
          isRegenerating: false,
          isStreaming: false,
          streamingContent: "",
          abortStream: null,
        });
        toast.error(error);
      }
    );

    set({ abortStream: abort });
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

  setSelectedUploads: (uploads) => {
    set({ selectedUploads: uploads });
    // Note: This is now just for local state. Use addSelectedUpload/removeSelectedUpload for server sync.
  },

  addSelectedUpload: (upload) => {
    // First update local state
    set((state) => ({
      selectedUploads: [...state.selectedUploads, upload],
    }));

    // Sync with server if we have a chat and it's not a placeholder
    const chatId = get().selectedChatId;
    if (chatId && !upload.id.startsWith("processing-")) {
      aiChatApi
        .addDocument(chatId, upload.id, upload.filename)
        .then(() => {
          console.log(`[Store] Added document to server: ${upload.filename}`);
        })
        .catch((err) => {
          console.error("Error adding document:", err);
        });
    }
  },

  removeSelectedUpload: (uploadId) => {
    // First update local state
    set((state) => ({
      selectedUploads: state.selectedUploads.filter((u) => u.id !== uploadId),
    }));

    // Sync with server if we have a chat and it's not a placeholder
    const chatId = get().selectedChatId;
    if (chatId && !uploadId.startsWith("processing-")) {
      aiChatApi
        .removeDocument(chatId, uploadId)
        .then(() => {
          console.log(`[Store] Removed document from server: ${uploadId}`);
        })
        .catch((err) => {
          console.error("Error removing document:", err);
        });
    }
  },

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

  /**
   * Upload PDF files using quick-upload (no waiting for OCR).
   * OCR/vectorization happens on-demand when first message is sent.
   */
  uploadPdf: async (files: File[]) => {
    set({ isProcessingPdf: true });

    try {
      // Process all files concurrently
      await Promise.all(
        files.map(async (file) => {
          try {
            // Use quick upload - returns immediately after R2 upload
            const result = await virtualTeacherApi.quickUploadFile(file);

            if (result.success) {
              const upload: RecentUpload = {
                id: result.userStorageId,
                filename: result.filename,
                url: result.url,
                size: file.size,
                mimeType: "application/pdf",
                createdAt: new Date().toISOString(),
                quizHistory: null,
                flashcardHistory: null,
              };

              get().addSelectedUpload(upload);
              console.log(
                `[Quick Upload] Success: ${result.filename} (${result.userStorageId})`
              );
            }
          } catch (error) {
            console.error(`Error uploading ${file.name}:`, error);
            toast.error(`Không thể tải lên: ${file.name}`);
          }
        })
      );

      set({ isProcessingPdf: false });
      toast.success("Đã tải lên tài liệu thành công");
    } catch (error) {
      console.error("Error in batch upload:", error);
      set({ isProcessingPdf: false });
      toast.error("Có lỗi xảy ra khi tải lên");
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
    const { abortStream } = get();
    if (abortStream) {
      abortStream();
    }
    set({
      messages: [],
      selectedChatId: null,
      streamingContent: "",
      isStreaming: false,
      abortStream: null,
      transcript: "",
      uploadedImageUrl: null,
      selectedUploads: [],
    });
    updateUrlQuery(null);
  },
}));
