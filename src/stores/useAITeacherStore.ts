import { create } from "zustand";
import { virtualTeacherApi } from "@/apis/virtualTeacherApi";
import { toast } from "@/components/ui/toast";
import { RecentUpload } from "@/apis/aiApi";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// TTS Configuration
const TTS_CONFIG = {
  API_URL: "https://proxy.junookyo.workers.dev/",
  LANGUAGE: "vi-VN",
  SPEED: 1,
  MAX_CHUNK_LENGTH: 200,
};

interface AITeacherState {
  // Messages
  messages: Message[];

  // Speech states
  isListening: boolean;
  isSpeaking: boolean;
  isProcessing: boolean;
  transcript: string;

  // Document
  selectedUpload: RecentUpload | null;

  // Audio for TTS
  currentAudio: HTMLAudioElement | null;
  audioQueue: string[];
  isPlayingQueue: boolean;

  // Actions
  addMessage: (role: "user" | "assistant", content: string) => void;
  clearMessages: () => void;
  setIsListening: (value: boolean) => void;
  setIsSpeaking: (value: boolean) => void;
  setTranscript: (value: string) => void;
  setSelectedUpload: (upload: RecentUpload | null) => void;
  sendMessage: (message: string) => Promise<void>;
  speakResponse: (text: string) => void;
  stopSpeaking: () => void;
}

// Generate unique ID
const generateId = () =>
  `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Split text into chunks of max length, breaking at sentence/word boundaries
 */
const splitTextIntoChunks = (text: string, maxLength: number): string[] => {
  const chunks: string[] = [];
  let remaining = text.trim();

  while (remaining.length > 0) {
    if (remaining.length <= maxLength) {
      chunks.push(remaining);
      break;
    }

    // Find the best break point within maxLength
    let breakPoint = maxLength;

    // Try to break at sentence end (. ! ?)
    const sentenceEnd = remaining.substring(0, maxLength).search(/[.!?][^.!?]*$/);
    if (sentenceEnd > 0) {
      breakPoint = sentenceEnd + 1;
    } else {
      // Try to break at comma or semicolon
      const clauseEnd = remaining.substring(0, maxLength).search(/[,;][^,;]*$/);
      if (clauseEnd > 0) {
        breakPoint = clauseEnd + 1;
      } else {
        // Try to break at space
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

/**
 * Build TTS URL for a text chunk
 */
const buildTTSUrl = (text: string): string => {
  const params = new URLSearchParams({
    language: TTS_CONFIG.LANGUAGE,
    text,
    speed: TTS_CONFIG.SPEED.toString(),
  });
  return `${TTS_CONFIG.API_URL}?${params.toString()}`;
};

export const useAITeacherStore = create<AITeacherState>((set, get) => ({
  messages: [],
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  transcript: "",
  selectedUpload: null,
  currentAudio: null,
  audioQueue: [],
  isPlayingQueue: false,

  addMessage: (role, content) => {
    const newMessage: Message = {
      id: generateId(),
      role,
      content,
      timestamp: new Date(),
    };
    set((state) => ({
      messages: [...state.messages, newMessage],
    }));
  },

  clearMessages: () => {
    set({ messages: [] });
  },

  setIsListening: (value) => {
    set({ isListening: value });
  },

  setIsSpeaking: (value) => {
    set({ isSpeaking: value });
  },

  setTranscript: (value) => {
    set({ transcript: value });
  },

  setSelectedUpload: (upload) => {
    set({ selectedUpload: upload });
  },

  sendMessage: async (message: string) => {
    const { selectedUpload, addMessage, speakResponse, stopSpeaking } = get();

    if (!message.trim()) return;

    // Stop any current speech
    stopSpeaking();

    // Add user message
    addMessage("user", message);
    set({ isProcessing: true, transcript: "" });

    try {
      const response = await virtualTeacherApi.chat({
        message,
        documentId: selectedUpload?.id,
      });

      if (response.success) {
        addMessage("assistant", response.response);
        // Auto speak the response
        speakResponse(response.response);
      } else {
        const errorMsg = response.error || "Có lỗi xảy ra. Vui lòng thử lại.";
        addMessage("assistant", errorMsg);
        toast.error(errorMsg);
      }
    } catch (error: unknown) {
      const errorMsg =
        error instanceof Error ? error.message : "Không thể kết nối tới server.";
      addMessage(
        "assistant",
        "Xin lỗi, tôi gặp lỗi khi xử lý. Vui lòng thử lại."
      );
      toast.error(errorMsg);
    } finally {
      set({ isProcessing: false });
    }
  },

  speakResponse: (text: string) => {
    const { stopSpeaking, setIsSpeaking } = get();

    // Stop any current speech first
    stopSpeaking();

    // Split text into chunks
    const chunks = splitTextIntoChunks(text, TTS_CONFIG.MAX_CHUNK_LENGTH);

    if (chunks.length === 0) {
      console.warn("No text to speak");
      return;
    }

    console.log(`🔊 Speaking ${chunks.length} chunks`);

    // Build audio URLs for all chunks
    const audioUrls = chunks.map((chunk) => buildTTSUrl(chunk));

    // Preloaded audio cache
    const preloadedAudios: Map<number, HTMLAudioElement> = new Map();

    // Preload an audio by index
    const preloadAudio = (index: number): HTMLAudioElement | null => {
      if (index >= audioUrls.length) return null;

      // Check if already preloaded
      if (preloadedAudios.has(index)) {
        return preloadedAudios.get(index)!;
      }

      const audio = new Audio();
      audio.preload = "auto";
      audio.src = audioUrls[index];
      preloadedAudios.set(index, audio);

      return audio;
    };

    // Preload first few chunks immediately
    for (let i = 0; i < Math.min(3, audioUrls.length); i++) {
      preloadAudio(i);
    }

    // Set up queue and start playing
    set({ audioQueue: audioUrls, isPlayingQueue: true });
    setIsSpeaking(true);

    // Play chunks sequentially with preloading
    const playNextChunk = (index: number) => {
      const state = get();

      // Check if stopped
      if (!state.isPlayingQueue || index >= audioUrls.length) {
        set({ isSpeaking: false, isPlayingQueue: false, currentAudio: null });
        preloadedAudios.clear();
        return;
      }

      // Get preloaded audio or create new one
      const audio = preloadedAudios.get(index) || new Audio(audioUrls[index]);
      set({ currentAudio: audio });

      // Preload next chunk when this one starts playing
      const nextIndex = index + 1;
      if (nextIndex < audioUrls.length) {
        preloadAudio(nextIndex);
        // Also preload one more ahead
        if (nextIndex + 1 < audioUrls.length) {
          preloadAudio(nextIndex + 1);
        }
      }

      audio.onended = () => {
        // Immediately play next chunk (it should be preloaded)
        playNextChunk(index + 1);
      };

      audio.onerror = (e) => {
        console.error("Audio playback error:", e);
        // Try next chunk even if this one failed
        playNextChunk(index + 1);
      };

      // Start playback
      audio.play().catch((err) => {
        console.error("Failed to play audio:", err);
        // Try next chunk
        playNextChunk(index + 1);
      });
    };

    // Start playing from first chunk
    playNextChunk(0);
  },

  stopSpeaking: () => {
    const { currentAudio } = get();

    // Stop current audio
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
}));
