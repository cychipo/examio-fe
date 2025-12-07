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

    // Helper function to find the best Vietnamese voice
    const findBestVietnameseVoice = (
      voices: SpeechSynthesisVoice[]
    ): SpeechSynthesisVoice | null => {
      // Filter Vietnamese voices
      const vietnameseVoices = voices.filter(
        (v) =>
          v.lang === "vi-VN" ||
          v.lang === "vi_VN" ||
          v.lang.startsWith("vi-") ||
          v.lang.startsWith("vi_")
      );

      if (vietnameseVoices.length === 0) {
        return null;
      }

      // Priority order for high-quality Vietnamese voices
      const priorityPatterns = [
        /google/i, // Google voices are usually best
        /microsoft/i, // Microsoft voices are good
        /natural/i, // Natural voices
        /neural/i, // Neural voices
        /premium/i, // Premium voices
      ];

      // Try to find a voice matching priority patterns
      for (const pattern of priorityPatterns) {
        const match = vietnameseVoices.find((v) => pattern.test(v.name));
        if (match) {
          console.log("Using Vietnamese voice:", match.name);
          return match;
        }
      }

      // Prefer non-local voices (usually cloud-based and better quality)
      const cloudVoice = vietnameseVoices.find((v) => !v.localService);
      if (cloudVoice) {
        console.log("Using cloud Vietnamese voice:", cloudVoice.name);
        return cloudVoice;
      }

      // Fallback to any Vietnamese voice
      console.log("Using fallback Vietnamese voice:", vietnameseVoices[0].name);
      return vietnameseVoices[0];
    };

    // Function to speak with the best available voice
    const speakWithVoice = (voices: SpeechSynthesisVoice[]) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "vi-VN";
      utterance.rate = 0.9; // Slightly slower for better pronunciation
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const bestVoice = findBestVietnameseVoice(voices);
      if (bestVoice) {
        utterance.voice = bestVoice;
      } else {
        console.warn(
          "No Vietnamese voice found, using default. Available voices:",
          voices.map((v) => `${v.name} (${v.lang})`)
        );
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
    };

    // Get voices - they might not be loaded yet
    let voices = window.speechSynthesis.getVoices();

    if (voices.length > 0) {
      // Voices already loaded
      speakWithVoice(voices);
    } else {
      // Wait for voices to be loaded
      const handleVoicesChanged = () => {
        voices = window.speechSynthesis.getVoices();
        if (voices.length > 0) {
          window.speechSynthesis.removeEventListener(
            "voiceschanged",
            handleVoicesChanged
          );
          speakWithVoice(voices);
        }
      };

      window.speechSynthesis.addEventListener(
        "voiceschanged",
        handleVoicesChanged
      );

      // Fallback timeout in case voiceschanged never fires
      setTimeout(() => {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          handleVoicesChanged
        );
        voices = window.speechSynthesis.getVoices();
        speakWithVoice(voices);
      }, 500);
    }
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
