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

  // Speech synthesis
  currentUtterance: SpeechSynthesisUtterance | null;

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
  setCurrentUtterance: (utterance: SpeechSynthesisUtterance | null) => void;
}

// Generate unique ID
const generateId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useAITeacherStore = create<AITeacherState>((set, get) => ({
  messages: [],
  isListening: false,
  isSpeaking: false,
  isProcessing: false,
  transcript: "",
  selectedUpload: null,
  currentUtterance: null,

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

  setCurrentUtterance: (utterance) => {
    set({ currentUtterance: utterance });
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
    } catch (error: any) {
      const errorMsg = error.message || "Không thể kết nối tới server.";
      addMessage("assistant", "Xin lỗi, tôi gặp lỗi khi xử lý. Vui lòng thử lại.");
      toast.error(errorMsg);
    } finally {
      set({ isProcessing: false });
    }
  },

  speakResponse: (text: string) => {
    const { setIsSpeaking, setCurrentUtterance } = get();

    // Check browser support
    if (!("speechSynthesis" in window)) {
      console.warn("Speech synthesis not supported");
      return;
    }

    // Cancel any current speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "vi-VN";
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    // Try to find Vietnamese voice
    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(
      (v) => v.lang.includes("vi") || v.lang.includes("VI")
    );
    if (viVoice) {
      utterance.voice = viVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    utterance.onerror = (event) => {
      console.error("Speech synthesis error:", event);
      setIsSpeaking(false);
      setCurrentUtterance(null);
    };

    setCurrentUtterance(utterance);
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking: () => {
    const { setIsSpeaking, setCurrentUtterance } = get();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    setIsSpeaking(false);
    setCurrentUtterance(null);
  },
}));
