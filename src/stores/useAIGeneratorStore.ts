import { create } from "zustand";
import { Quizz, Flashcard, TypeResultGenerateExam } from "@/types/exam";
import { generateExamApi } from "@/apis/examApi";
import { toast } from "@/components/ui/toast";
import { aiApi, RecentUpload } from "@/apis/aiApi";
import { storeCache } from "@/lib/storeCache";

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface TestGeneratorState {
  file: File | null;
  uploadId: string | null; // ID của upload từ recent files
  fileInfo: FileInfo | null; // Thông tin file khi load từ recent
  questionCount: number;
  isNarrow: boolean;
  keyword: string;
  generatedTest: Quizz[] | null;
  generatedTestId: string | null; // ID của bản generate
  isGenerating: boolean;
  setFile: (file: File | null) => void;
  setQuestionCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  generateTest: () => Promise<void>;
  clearTest: () => void;
}

interface FlashcardGeneratorState {
  file: File | null;
  uploadId: string | null;
  fileInfo: FileInfo | null;
  cardCount: number;
  isNarrow: boolean;
  keyword: string;
  generatedCards: Flashcard[] | null;
  generatedCardsId: string | null; // ID của bản generate
  currentCard: number;
  isGenerating: boolean;
  setFile: (file: File | null) => void;
  setCardCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  setCurrentCard: (index: number) => void;
  generateFlashcards: () => Promise<void>;
  clearFlashcards: () => void;
}

// Test Generator Store
export const useTestGeneratorStore = create<TestGeneratorState>((set, get) => ({
  file: null,
  uploadId: null,
  fileInfo: null,
  questionCount: 10,
  isNarrow: false,
  keyword: "",
  generatedTest: null,
  generatedTestId: null,
  isGenerating: false,

  setFile: (file) => {
    set({ file, uploadId: null, fileInfo: null });
    // Also set file in flashcard generator
    if (file) {
      useFlashcardGeneratorStore.setState({
        file,
        uploadId: null,
        fileInfo: null,
      });
    }
  },
  setQuestionCount: (questionCount) => set({ questionCount }),
  setIsNarrow: (isNarrow) => set({ isNarrow }),
  setKeyword: (keyword) => set({ keyword }),

  generateTest: async () => {
    const { file, uploadId, questionCount, isNarrow, keyword } = get();

    if (!file && !uploadId) {
      toast.error("Chưa có file", {
        description: "Vui lòng tải lên file PDF trước",
      });
      return;
    }

    if (isNarrow && !keyword.trim()) {
      toast.error("Chưa nhập từ khóa", {
        description: "Vui lòng nhập từ khóa khi sử dụng định dạng hẹp",
      });
      return;
    }

    set({ isGenerating: true });

    try {
      // Nếu có uploadId (từ recent files), sử dụng regenerate API
      if (uploadId) {
        const result = await aiApi.regenerateFromUpload(uploadId, {
          typeResult: TypeResultGenerateExam.QUIZZ,
          quantityQuizz: questionCount,
          isNarrowSearch: isNarrow,
          keyword: isNarrow ? keyword : undefined,
        });

        set({
          generatedTest: result.quizzes || null,
          generatedTestId: result.historyId || null,
          isGenerating: false,
        });

        toast.success("Tạo đề kiểm tra thành công", {
          description: `Đã tạo ${result.quizzes?.length || 0} câu hỏi`,
        });
        return;
      }

      // Nếu có file mới, sử dụng generate API với job queue
      const jobResponse = await generateExamApi({
        file: file!,
        quantityQuizz: questionCount,
        typeResult: TypeResultGenerateExam.QUIZZ,
        isNarrowSearch: isNarrow,
        keyword: isNarrow ? keyword : undefined,
      });

      // Start polling for job status
      const jobId = jobResponse.jobId;
      const pollInterval = 2000; // Poll every 2 seconds
      let attempts = 0;
      const maxAttempts = 150; // Max 5 minutes (150 * 2s)

      const poll = async () => {
        try {
          const jobStatus = await aiApi.getJobStatus(jobId);

          if (jobStatus.status === "completed" && jobStatus.result) {
            set({
              generatedTest: (jobStatus.result.quizzes as any) || [],
              generatedTestId: jobStatus.result.historyId || null,
              isGenerating: false,
            });
            toast.success("Tạo đề thành công!", {
              description: `Đã tạo ${
                jobStatus.result.quizzes?.length || 0
              } câu hỏi từ tài liệu của bạn`,
            });
            // Refresh recent uploads list after successful generation
            useRecentUploadsStore.getState().fetchRecentUploads(true);
            return;
          }

          if (jobStatus.status === "failed") {
            throw new Error(jobStatus.error || "Job failed");
          }

          // Still processing, poll again
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            throw new Error("Timeout: Job took too long to complete");
          }
        } catch (error) {
          set({ isGenerating: false });
          toast.error("Lỗi tạo đề", {
            description:
              error instanceof Error
                ? error.message
                : "Có lỗi xảy ra khi tạo đề kiểm tra",
          });
          console.error("Error polling job status:", error);
        }
      };

      // Start polling
      setTimeout(poll, pollInterval);
    } catch (error) {
      set({ isGenerating: false });
      toast.error("Lỗi tạo đề", {
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo đề kiểm tra",
      });
      console.error("Error generating test:", error);
    }
  },

  clearTest: () =>
    set({
      file: null,
      uploadId: null,
      fileInfo: null,
      generatedTest: null,
      generatedTestId: null,
      questionCount: 10,
      isNarrow: false,
      keyword: "",
    }),
}));

// Flashcard Generator Store
export const useFlashcardGeneratorStore = create<FlashcardGeneratorState>(
  (set, get) => ({
    file: null,
    uploadId: null,
    fileInfo: null,
    cardCount: 15,
    isNarrow: false,
    keyword: "",
    generatedCards: null,
    generatedCardsId: null,
    currentCard: 0,
    isGenerating: false,

    setFile: (file) => set({ file, uploadId: null, fileInfo: null }),
    setCardCount: (cardCount) => set({ cardCount }),
    setIsNarrow: (isNarrow) => set({ isNarrow }),
    setKeyword: (keyword) => set({ keyword }),
    setCurrentCard: (currentCard) => set({ currentCard }),

    generateFlashcards: async () => {
      const { file, uploadId, cardCount, isNarrow, keyword } = get();

      if (!file && !uploadId) {
        toast.error("Chưa có file", {
          description: "Vui lòng tải lên file PDF trước",
        });
        return;
      }

      if (isNarrow && !keyword.trim()) {
        toast.error("Chưa nhập từ khóa", {
          description: "Vui lòng nhập từ khóa khi sử dụng định dạng thẻ hẹp",
        });
        return;
      }

      set({ isGenerating: true });

      try {
        // Nếu có uploadId (từ recent files), sử dụng regenerate API
        if (uploadId) {
          const result = await aiApi.regenerateFromUpload(uploadId, {
            typeResult: TypeResultGenerateExam.FLASHCARD,
            quantityFlashcard: cardCount,
            isNarrowSearch: isNarrow,
            keyword: isNarrow ? keyword : undefined,
          });

          set({
            generatedCards: result.flashcards || null,
            generatedCardsId: result.historyId || null,
            currentCard: 0,
            isGenerating: false,
          });

          toast.success("Tạo flashcard thành công", {
            description: `Đã tạo ${
              result.flashcards?.length || 0
            } thẻ flashcard`,
          });
          return;
        }

        // Nếu có file mới, sử dụng generate API với job queue
        const jobResponse = await generateExamApi({
          file: file!,
          quantityFlashcard: cardCount,
          typeResult: TypeResultGenerateExam.FLASHCARD,
          isNarrowSearch: isNarrow,
          keyword: isNarrow ? keyword : undefined,
        });

        // Start polling for job status
        const jobId = jobResponse.jobId;
        const pollInterval = 2000; // Poll every 2 seconds
        let attempts = 0;
        const maxAttempts = 150; // Max 5 minutes

        const poll = async () => {
          try {
            const jobStatus = await aiApi.getJobStatus(jobId);

            if (jobStatus.status === "completed" && jobStatus.result) {
              set({
                generatedCards: (jobStatus.result.flashcards as any) || [],
                generatedCardsId: jobStatus.result.historyId || null,
                currentCard: 0,
                isGenerating: false,
              });
              toast.success("Tạo flashcard thành công!", {
                description: `Đã tạo ${
                  jobStatus.result.flashcards?.length || 0
                } thẻ flashcard từ tài liệu của bạn`,
              });
              // Refresh recent uploads list after successful generation
              useRecentUploadsStore.getState().fetchRecentUploads(true);
              return;
            }

            if (jobStatus.status === "failed") {
              throw new Error(jobStatus.error || "Job failed");
            }

            // Still processing, poll again
            attempts++;
            if (attempts < maxAttempts) {
              setTimeout(poll, pollInterval);
            } else {
              throw new Error("Timeout: Job took too long to complete");
            }
          } catch (error) {
            set({ isGenerating: false });
            toast.error("Lỗi tạo flashcard", {
              description:
                error instanceof Error
                  ? error.message
                  : "Có lỗi xảy ra khi tạo flashcard",
            });
            console.error("Error polling job status:", error);
          }
        };

        // Start polling
        setTimeout(poll, pollInterval);
      } catch (error) {
        set({ isGenerating: false });
        toast.error("Lỗi tạo flashcard", {
          description:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi tạo flashcard",
        });
        console.error("Error generating flashcards:", error);
      }
    },

    clearFlashcards: () =>
      set({
        file: null,
        uploadId: null,
        fileInfo: null,
        generatedCards: null,
        generatedCardsId: null,
        currentCard: 0,
        cardCount: 15,
        isNarrow: false,
        keyword: "",
      }),
  })
);

// Recent Uploads Store
interface RecentUploadsState {
  recentUploads: RecentUpload[];
  isLoading: boolean;
  selectedUpload: RecentUpload | null;
  isRegenerating: boolean;
  isDeleting: boolean;
  fetchRecentUploads: (forceRefresh?: boolean) => Promise<void>;
  selectUpload: (upload: RecentUpload | null) => void;
  deleteUpload: (uploadId: string) => Promise<void>;
  loadFromUpload: (upload: RecentUpload, type: "quiz" | "flashcard") => void;
  clearSelection: () => void;
}

const CACHE_KEY = "recent-uploads";

export const useRecentUploadsStore = create<RecentUploadsState>((set, get) => ({
  recentUploads: [],
  isLoading: false,
  selectedUpload: null,
  isRegenerating: false,
  isDeleting: false,

  fetchRecentUploads: async (forceRefresh = false) => {
    // Check cache first unless force refresh
    if (!forceRefresh) {
      const cached = storeCache.get<RecentUpload[]>(CACHE_KEY);
      if (cached) {
        set({ recentUploads: cached });
        return;
      }
    }

    set({ isLoading: true });
    try {
      const uploads = await aiApi.getRecentUploads(10);
      storeCache.set(CACHE_KEY, uploads);
      set({ recentUploads: uploads, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      console.error("Error fetching recent uploads:", error);
    }
  },

  selectUpload: (upload) => {
    set({ selectedUpload: upload });

    // Khi chọn file từ recent, set file info vào generator stores
    if (upload) {
      // Set data vào TestGenerator store nếu có quiz history
      if (upload.quizHistory) {
        useTestGeneratorStore.setState({
          generatedTest: upload.quizHistory.quizzes as Quizz[],
          generatedTestId: upload.id,
        });
      }

      // Set data vào FlashcardGenerator store nếu có flashcard history
      if (upload.flashcardHistory) {
        useFlashcardGeneratorStore.setState({
          generatedCards: upload.flashcardHistory.flashcards as Flashcard[],
          generatedCardsId: upload.id,
          currentCard: 0,
        });
      }
    }
  },

  deleteUpload: async (uploadId) => {
    set({ isDeleting: true });
    try {
      await aiApi.deleteUpload(uploadId);

      // Remove from local state
      const { recentUploads, selectedUpload } = get();
      const newUploads = recentUploads.filter((u) => u.id !== uploadId);
      set({
        recentUploads: newUploads,
        isDeleting: false,
        selectedUpload: selectedUpload?.id === uploadId ? null : selectedUpload,
      });

      // Invalidate cache
      storeCache.invalidate(CACHE_KEY);

      toast.success("Đã xóa file", {
        description: "File và dữ liệu liên quan đã được xóa",
      });
    } catch (error) {
      set({ isDeleting: false });
      toast.error("Lỗi xóa file", {
        description:
          error instanceof Error ? error.message : "Có lỗi xảy ra khi xóa file",
      });
      console.error("Error deleting upload:", error);
    }
  },

  loadFromUpload: (upload, type) => {
    set({ selectedUpload: upload });

    // Create a mock File object info for the upload card
    const fileInfo = {
      name: upload.filename,
      size: upload.size,
      type: upload.mimeType,
    };

    // ALWAYS set file info to BOTH generators so switching tabs works
    useTestGeneratorStore.setState({
      file: null, // No actual file, but we have upload ID
      uploadId: upload.id,
      fileInfo,
      // Load existing quiz if available
      generatedTest: upload.quizHistory?.quizzes as Quizz[] | null,
      generatedTestId: upload.quizHistory ? upload.id : null,
    });

    useFlashcardGeneratorStore.setState({
      file: null,
      uploadId: upload.id,
      fileInfo,
      // Load existing flashcards if available
      generatedCards: upload.flashcardHistory?.flashcards as Flashcard[] | null,
      generatedCardsId: upload.flashcardHistory ? upload.id : null,
      currentCard: 0,
    });

    toast.success("Đã chọn file", {
      description: `File "${upload.filename}" đã được chọn sẵn cho cả Quiz và Flashcard.`,
    });
  },

  clearSelection: () => set({ selectedUpload: null }),
}));
