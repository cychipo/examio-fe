/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
import { create } from "zustand";
import { Quizz, Flashcard, TypeResultGenerateExam } from "@/types/exam";
import { generateExamApi } from "@/apis/examApi";
import { toast } from "@/components/ui/toast";
import { aiApi, RecentUpload } from "@/apis/aiApi";
import { storeCache } from "@/lib/storeCache";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  AIModelType,
  DEFAULT_AI_MODEL,
  MODEL_UNAVAILABLE_MESSAGE,
} from "@/types/ai";
import { useAIModelCatalogStore } from "@/stores/useAIModelCatalogStore";

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

const PENDING_JOB_STORAGE_KEY = "pending_generation_job";

type GenerationResultType = "quiz" | "flashcard";

interface PersistedPendingJob {
  jobId: string;
  expectedResultType?: GenerationResultType;
}

const getPersistedPendingJob = (): PersistedPendingJob | null => {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(PENDING_JOB_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.jobId === "string"
    ) {
      return {
        jobId: parsed.jobId,
        expectedResultType:
          parsed.expectedResultType === "quiz" ||
          parsed.expectedResultType === "flashcard"
            ? parsed.expectedResultType
            : undefined,
      };
    }
  } catch {
    // Backward compatibility: old format stored raw jobId string
  }

  return { jobId: raw };
};

// Helper to persist job metadata to localStorage
const persistPendingJob = (
  jobId: string | null,
  expectedResultType?: GenerationResultType | null,
) => {
  if (typeof window === "undefined") return;
  if (jobId) {
    localStorage.setItem(
      PENDING_JOB_STORAGE_KEY,
      JSON.stringify({
        jobId,
        ...(expectedResultType ? { expectedResultType } : {}),
      }),
    );
  } else {
    localStorage.removeItem(PENDING_JOB_STORAGE_KEY);
  }
};

// Pending job info returned when checking for orphaned jobs
interface PendingJobInfo {
  jobId: string;
  status: "pending" | "processing" | "completed" | "failed";
  expectedResultType?: GenerationResultType;
}

// Shared job state for both stores
interface JobState {
  currentJobId: string | null;
  pendingJobInfo: PendingJobInfo | null;
  showPendingJobDialog: boolean;
  setCurrentJobId: (
    jobId: string | null,
    expectedResultType?: GenerationResultType | null,
  ) => void;
  cancelCurrentJob: () => Promise<void>;
  checkForPendingJob: () => Promise<PendingJobInfo | null>;
  resumePendingJob: () => void;
  cancelPendingJob: () => Promise<void>;
  closePendingJobDialog: () => void;
}

export const useJobStore = create<JobState>((set, get) => ({
  currentJobId: null,
  pendingJobInfo: null,
  showPendingJobDialog: false,
  setCurrentJobId: (jobId, expectedResultType) => {
    set({ currentJobId: jobId });
    persistPendingJob(jobId, expectedResultType);
  },
  cancelCurrentJob: async () => {
    const { currentJobId } = get();
    if (currentJobId) {
      try {
        await aiApi.cancelJob(currentJobId);
        console.log(`🚫 Job ${currentJobId} canceled and OCR data cleared`);
        toast.info("Đã dừng tác vụ", {
          description: "OCR và embeddings đã được xóa, file vẫn được giữ lại.",
        });
      } catch (error) {
        console.error("Error canceling job:", error);
      }
      set({ currentJobId: null });
      persistPendingJob(null);
    }
  },
  // Check for pending job from previous session (does NOT auto-cancel)
  checkForPendingJob: async () => {
    const persistedPendingJob = getPersistedPendingJob();
    if (!persistedPendingJob) return null;

    const { jobId: pendingJobId, expectedResultType } = persistedPendingJob;

    console.log(`🔍 Found pending job from previous session: ${pendingJobId}`);

    try {
      // Check job status
      const jobStatus = await aiApi.getJobStatus(pendingJobId);

      if (jobStatus.status === "processing" || jobStatus.status === "pending") {
        // Job is still running, show dialog to ask user
        const pendingInfo: PendingJobInfo = {
          jobId: pendingJobId,
          status: jobStatus.status,
          expectedResultType,
        };
        set({
          pendingJobInfo: pendingInfo,
          showPendingJobDialog: true,
        });
        return pendingInfo;
      } else if (jobStatus.status === "completed") {
        // Job completed, just clean up
        console.log(`✅ Pending job ${pendingJobId} had completed`);
        persistPendingJob(null);
        return null;
      } else if (jobStatus.status === "failed") {
        // Job failed, clean up
        console.log(`❌ Pending job ${pendingJobId} had failed`);
        persistPendingJob(null);
        return null;
      }
    } catch (error) {
      // Job not found or already cleaned up
      console.log(`Job ${pendingJobId} not found, already cleaned up`);
      persistPendingJob(null);
    }

    return null;
  },
  // Resume polling for pending job
  resumePendingJob: () => {
    const { pendingJobInfo } = get();
    if (!pendingJobInfo) return;

    const { jobId } = pendingJobInfo;
    console.log(`🔄 Resuming polling for job ${jobId}...`);

    // Set current job ID and keep expected type metadata for resume flow
    persistPendingJob(jobId, pendingJobInfo.expectedResultType);
    set({
      currentJobId: jobId,
      showPendingJobDialog: false,
      pendingJobInfo: null,
    });

    // Set isGenerating in both stores (we don't know which one started the job)
    useTestGeneratorStore.setState({ isGenerating: true });
    useFlashcardGeneratorStore.setState({ isGenerating: true });

    // Determine which store to use based on job (we'll poll and update both for simplicity)
    // The success callback will update the appropriate store based on result type
    pollJobStatus(
      jobId,
      // onProgress
      (progress) => {
        console.log(`📊 Resumed job ${jobId} progress: ${progress}%`);
      },
      // onSuccess
      (result) => {
        console.log(`✅ Resumed job ${jobId} completed:`, result);

        // Update appropriate store based on result type
        if (result.quizzes && result.quizzes.length > 0) {
          useTestGeneratorStore.setState({
            generatedTest: result.quizzes,
            generatedTestId: result.historyId || null,
            isGenerating: false,
          });
          useFlashcardGeneratorStore.setState({ isGenerating: false });
          toast.success("Tạo đề thành công!", {
            description: `Đã tạo ${result.quizzes.length} câu hỏi từ tài liệu của bạn`,
          });
        } else if (result.flashcards && result.flashcards.length > 0) {
          useFlashcardGeneratorStore.setState({
            generatedCards: result.flashcards,
            generatedCardsId: result.historyId || null,
            currentCard: 0,
            isGenerating: false,
          });
          useTestGeneratorStore.setState({ isGenerating: false });
          toast.success("Tạo flashcard thành công!", {
            description: `Đã tạo ${result.flashcards.length} thẻ flashcard từ tài liệu của bạn`,
          });
        } else {
          // Unknown result type, clear both
          useTestGeneratorStore.setState({ isGenerating: false });
          useFlashcardGeneratorStore.setState({ isGenerating: false });
        }

        // Refresh data
        useRecentUploadsStore.getState().fetchRecentUploads(true);
        useAuthStore.getState().getUser();
      },
      // onError
      (error) => {
        console.error(`❌ Resumed job ${jobId} failed:`, error);
        useTestGeneratorStore.setState({ isGenerating: false });
        useFlashcardGeneratorStore.setState({ isGenerating: false });
        toast.error("Lỗi xử lý tác vụ", {
          description: error,
        });
      },
      JOB_POLL_INTERVAL_MS,
      JOB_POLL_MAX_ATTEMPTS,
      pendingJobInfo.expectedResultType,
    );
  },
  // Cancel pending job from previous session
  cancelPendingJob: async () => {
    const { pendingJobInfo } = get();
    if (!pendingJobInfo) return;

    const { jobId } = pendingJobInfo;
    console.log(`🚫 Canceling pending job ${jobId}...`);

    try {
      await aiApi.cancelJob(jobId);
      toast.info("Đã dừng tác vụ trước đó", {
        description: "OCR và embeddings đã được xóa, file vẫn được giữ lại.",
      });
    } catch (error) {
      console.error("Error canceling pending job:", error);
    }

    persistPendingJob(null);
    set({
      currentJobId: null,
      pendingJobInfo: null,
      showPendingJobDialog: false,
    });
  },
  closePendingJobDialog: () => {
    set({ showPendingJobDialog: false });
  },
}));

const getGenerationResultType = (result: any): GenerationResultType | null => {
  if (!result) return null;
  if (result.type === "quiz" || result.type === "flashcard") {
    return result.type;
  }
  if (Array.isArray(result.quizzes)) {
    return "quiz";
  }
  if (Array.isArray(result.flashcards)) {
    return "flashcard";
  }
  return null;
};

const JOB_POLL_INTERVAL_MS = 10_000;
const JOB_POLL_MAX_ATTEMPTS = 360;

// Helper function for polling job status
// Extended timeout: 360 attempts * 10s = 60 minutes (Ollama/local AI can be slow for large jobs)
const pollJobStatus = async (
  jobId: string,
  onProgress: (progress: number) => void,
  onSuccess: (result: any) => void,
  onError: (error: string) => void,
  pollInterval: number = JOB_POLL_INTERVAL_MS,
  maxAttempts: number = JOB_POLL_MAX_ATTEMPTS,
  expectedResultType?: GenerationResultType,
) => {
  let attempts = 0;

  const poll = async () => {
    // Check if job was canceled
    if (useJobStore.getState().currentJobId !== jobId) {
      console.log(`Job ${jobId} was canceled, stopping poll`);
      return;
    }

    try {
      const jobStatus = await aiApi.getJobStatus(jobId);

      if (jobStatus.progress) {
        onProgress(jobStatus.progress);
      }

      if (jobStatus.status === "completed" && jobStatus.result) {
        const actualResultType = getGenerationResultType(jobStatus.result);

        if (
          expectedResultType &&
          (!actualResultType || actualResultType !== expectedResultType)
        ) {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(poll, pollInterval);
          } else {
            useJobStore.getState().setCurrentJobId(null);
            onError("Timeout: Job took too long to complete");
          }
          return;
        }

        useJobStore.getState().setCurrentJobId(null);
        onSuccess(jobStatus.result);
        return;
      }

      if (jobStatus.status === "failed") {
        useJobStore.getState().setCurrentJobId(null);
        onError(jobStatus.error || "Job failed");
        return;
      }

      // Still processing, poll again
      attempts++;
      if (attempts < maxAttempts) {
        setTimeout(poll, pollInterval);
      } else {
        useJobStore.getState().setCurrentJobId(null);
        onError("Timeout: Job took too long to complete");
      }
    } catch (error) {
      useJobStore.getState().setCurrentJobId(null);
      onError(error instanceof Error ? error.message : "Unknown error");
    }
  };

  // Start polling
  setTimeout(poll, pollInterval);
};

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
  selectedModel: AIModelType;
  setFile: (file: File | null) => void;
  setQuestionCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  setSelectedModel: (model: AIModelType) => void;
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
  selectedModel: AIModelType;
  setFile: (file: File | null) => void;
  setCardCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  setCurrentCard: (index: number) => void;
  setSelectedModel: (model: AIModelType) => void;
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
  selectedModel:
    useAIModelCatalogStore.getState().defaultModel || DEFAULT_AI_MODEL,

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
  setSelectedModel: (selectedModel) => {
    set({ selectedModel });
    // Sync with flashcard generator
    useFlashcardGeneratorStore.setState({ selectedModel });
  },

  generateTest: async () => {
    const {
      file,
      uploadId,
      fileInfo,
      questionCount,
      isNarrow,
      keyword,
      selectedModel,
    } = get();

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

    // Check balance before proceeding
    const user = useAuthStore.getState().user;
    const balance = user?.wallet?.balance || 0;

    // Calculate cost
    const { calculateTotalCost, calculateRegenerateCost, checkBalance } =
      await import("@/lib/creditUtils");

    let requiredCost: number;
    if (uploadId && fileInfo) {
      // Regenerating from existing file - only question cost
      requiredCost = calculateRegenerateCost(questionCount);
    } else if (file) {
      // New file - OCR + question cost
      const costs = calculateTotalCost(file.size, questionCount);
      requiredCost = costs.totalCost;
    } else {
      requiredCost = calculateRegenerateCost(questionCount);
    }

    const { isEnough, deficit } = checkBalance(balance, requiredCost);
    if (!isEnough) {
      toast.error("Không đủ tín dụng", {
        description: `Cần ${requiredCost} token, hiện có ${balance} token. Thiếu ${deficit} token.`,
      });
      return;
    }

    set({ isGenerating: true });

    try {
      let jobId: string;

      // Nếu có uploadId (từ recent files), sử dụng regenerate API với job queue
      if (uploadId) {
        const jobResponse = await aiApi.regenerateFromUpload(uploadId, {
          typeResult: TypeResultGenerateExam.QUIZZ,
          quantityQuizz: questionCount,
          isNarrowSearch: isNarrow,
          keyword: isNarrow ? keyword : undefined,
          modelType: selectedModel,
        });
        if (jobResponse.newBalance !== undefined) {
          useAuthStore.getState().updateWalletBalance(jobResponse.newBalance);
        }
        jobId = jobResponse.jobId;
      } else {
        // Nếu có file mới, sử dụng generate API với job queue
        const jobResponse = await generateExamApi({
          file: file!,
          quantityQuizz: questionCount,
          typeResult: TypeResultGenerateExam.QUIZZ,
          isNarrowSearch: isNarrow,
          keyword: isNarrow ? keyword : undefined,
          modelType: selectedModel,
        });
        if (jobResponse.newBalance !== undefined) {
          useAuthStore.getState().updateWalletBalance(jobResponse.newBalance);
        }
        jobId = jobResponse.jobId;
      }

      // Track job in shared store
      useJobStore.getState().setCurrentJobId(jobId, "quiz");

      // Start polling for job status using helper
      pollJobStatus(
        jobId,
        // onProgress
        (progress) => {},
        // onSuccess
        (result) => {
          set({
            generatedTest: (result.quizzes as any) || [],
            generatedTestId: result.historyId || null,
            isGenerating: false,
          });
          toast.success("Tạo đề thành công!", {
            description: `Đã tạo ${
              result.quizzes?.length || 0
            } câu hỏi từ tài liệu của bạn`,
          });
          // Refresh recent uploads list after successful generation
          useRecentUploadsStore.getState().fetchRecentUploads(true);
          // Refresh user data to update wallet balance
          useAuthStore.getState().getUser();
        },
        // onError
        (error) => {
          set({ isGenerating: false });
          toast.error("Lỗi tạo đề", {
            description:
              error === MODEL_UNAVAILABLE_MESSAGE
                ? MODEL_UNAVAILABLE_MESSAGE
                : error,
          });
          console.error("Error generating test:", error);
        },
        JOB_POLL_INTERVAL_MS,
        JOB_POLL_MAX_ATTEMPTS,
        "quiz",
      );
    } catch (error) {
      set({ isGenerating: false });
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo đề kiểm tra";
      toast.error("Lỗi tạo đề", {
        description:
          errorMessage === MODEL_UNAVAILABLE_MESSAGE
            ? MODEL_UNAVAILABLE_MESSAGE
            : errorMessage,
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
      selectedModel:
        useAIModelCatalogStore.getState().defaultModel || DEFAULT_AI_MODEL,
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
    selectedModel:
      useAIModelCatalogStore.getState().defaultModel || DEFAULT_AI_MODEL,

    setFile: (file) => {
      set({ file, uploadId: null, fileInfo: null });
      // Also set file in test generator
      if (file) {
        useTestGeneratorStore.setState({
          file,
          uploadId: null,
          fileInfo: null,
        });
      }
    },
    setCardCount: (cardCount) => set({ cardCount }),
    setIsNarrow: (isNarrow) => set({ isNarrow }),
    setKeyword: (keyword) => set({ keyword }),
    setCurrentCard: (currentCard) => set({ currentCard }),
    setSelectedModel: (selectedModel) => {
      set({ selectedModel });
      // Sync with test generator
      useTestGeneratorStore.setState({ selectedModel });
    },

    generateFlashcards: async () => {
      const {
        file,
        uploadId,
        fileInfo,
        cardCount,
        isNarrow,
        keyword,
        selectedModel,
      } = get();

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

      // Check balance before proceeding
      const user = useAuthStore.getState().user;
      const balance = user?.wallet?.balance || 0;

      // Calculate cost
      const { calculateTotalCost, calculateRegenerateCost, checkBalance } =
        await import("@/lib/creditUtils");

      let requiredCost: number;
      if (uploadId && fileInfo) {
        // Regenerating from existing file - only question cost
        requiredCost = calculateRegenerateCost(cardCount);
      } else if (file) {
        // New file - OCR + question cost
        const costs = calculateTotalCost(file.size, cardCount);
        requiredCost = costs.totalCost;
      } else {
        requiredCost = calculateRegenerateCost(cardCount);
      }

      const { isEnough, deficit } = checkBalance(balance, requiredCost);
      if (!isEnough) {
        toast.error("Không đủ tín dụng", {
          description: `Cần ${requiredCost} token, hiện có ${balance} token. Thiếu ${deficit} token.`,
        });
        return;
      }

      set({ isGenerating: true });

      try {
        let jobId: string;

        // Nếu có uploadId (từ recent files), sử dụng regenerate API với job queue
        if (uploadId) {
          const jobResponse = await aiApi.regenerateFromUpload(uploadId, {
            typeResult: TypeResultGenerateExam.FLASHCARD,
            quantityFlashcard: cardCount,
            isNarrowSearch: isNarrow,
            keyword: isNarrow ? keyword : undefined,
            modelType: selectedModel,
          });
          if (jobResponse.newBalance !== undefined) {
            useAuthStore.getState().updateWalletBalance(jobResponse.newBalance);
          }
          jobId = jobResponse.jobId;
        } else {
          // Nếu có file mới, sử dụng generate API với job queue
          const jobResponse = await generateExamApi({
            file: file!,
            quantityFlashcard: cardCount,
            typeResult: TypeResultGenerateExam.FLASHCARD,
            isNarrowSearch: isNarrow,
            keyword: isNarrow ? keyword : undefined,
            modelType: selectedModel,
          });
          if (jobResponse.newBalance !== undefined) {
            useAuthStore.getState().updateWalletBalance(jobResponse.newBalance);
          }
          jobId = jobResponse.jobId;
        }

        // Track job in shared store
        useJobStore.getState().setCurrentJobId(jobId, "flashcard");

        // Start polling for job status using helper
        pollJobStatus(
          jobId,
          // onProgress
          (progress) => {
            console.log(`📊 Job ${jobId} progress: ${progress}%`);
          },
          // onSuccess
          (result) => {
            set({
              generatedCards: (result.flashcards as any) || [],
              generatedCardsId: result.historyId || null,
              currentCard: 0,
              isGenerating: false,
            });
            toast.success("Tạo flashcard thành công!", {
              description: `Đã tạo ${
                result.flashcards?.length || 0
              } thẻ flashcard từ tài liệu của bạn`,
            });
            // Refresh recent uploads list after successful generation
            useRecentUploadsStore.getState().fetchRecentUploads(true);
            // Refresh user data to update wallet balance
            useAuthStore.getState().getUser();
          },
          // onError
          (error) => {
            set({ isGenerating: false });
            toast.error("Lỗi tạo flashcard", {
              description:
                error === MODEL_UNAVAILABLE_MESSAGE
                  ? MODEL_UNAVAILABLE_MESSAGE
                  : error,
            });
            console.error("Error generating flashcards:", error);
          },
          JOB_POLL_INTERVAL_MS,
          JOB_POLL_MAX_ATTEMPTS,
          "flashcard",
        );
      } catch (error) {
        set({ isGenerating: false });
        const errorMessage =
          error instanceof Error ? error.message : "Có lỗi xảy ra khi tạo flashcard";
        toast.error("Lỗi tạo flashcard", {
          description:
            errorMessage === MODEL_UNAVAILABLE_MESSAGE
              ? MODEL_UNAVAILABLE_MESSAGE
              : errorMessage,
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
        selectedModel:
          useAIModelCatalogStore.getState().defaultModel || DEFAULT_AI_MODEL,
      }),
  }),
);

interface RecentUploadsState {
  recentUploads: RecentUpload[];
  isLoading: boolean;
  selectedUpload: RecentUpload | null;
  isRegenerating: boolean;
  isDeleting: boolean;
  fetchRecentUploads: (
    forceRefresh?: boolean,
    includeHistory?: boolean,
  ) => Promise<void>;
  selectUpload: (upload: RecentUpload | null) => void;
  deleteUpload: (uploadId: string) => Promise<void>;
  loadFromUpload: (upload: RecentUpload) => void;
  clearSelection: () => void;
}

const CACHE_KEY = "recent-uploads";

export const useRecentUploadsStore = create<RecentUploadsState>((set, get) => ({
  recentUploads: [],
  isLoading: false,
  selectedUpload: null,
  isRegenerating: false,
  isDeleting: false,

  fetchRecentUploads: async (forceRefresh = false, _includeHistory = true) => {
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
  },

  deleteUpload: async (uploadId) => {
    set({ isDeleting: true });
    try {
      await aiApi.deleteUpload(uploadId);

      // Remove from local state
      const { recentUploads, selectedUpload } = get();
      const newUploads = recentUploads.filter((u) => u.id !== uploadId);

      // Check if deleted file was selected in either generator store
      const testStore = useTestGeneratorStore.getState();
      const flashcardStore = useFlashcardGeneratorStore.getState();

      // Clear TestGeneratorStore if it was using the deleted file
      if (testStore.uploadId === uploadId) {
        useTestGeneratorStore.setState({
          file: null,
          uploadId: null,
          fileInfo: null,
          generatedTest: null,
          generatedTestId: null,
        });
      }

      // Clear FlashcardGeneratorStore if it was using the deleted file
      if (flashcardStore.uploadId === uploadId) {
        useFlashcardGeneratorStore.setState({
          file: null,
          uploadId: null,
          fileInfo: null,
          generatedCards: null,
          generatedCardsId: null,
          currentCard: 0,
        });
      }

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

  loadFromUpload: async (upload) => {
    set({ selectedUpload: upload });

    // Create a mock File object info for the upload card
    const fileInfo = {
      name: upload.filename,
      size: upload.size,
      type: upload.mimeType,
    };

    // Set initial file info to BOTH generators
    useTestGeneratorStore.setState({
      file: null,
      uploadId: upload.id,
      fileInfo,
      generatedTest: null,
      generatedTestId: null,
    });

    useFlashcardGeneratorStore.setState({
      file: null,
      uploadId: upload.id,
      fileInfo,
      generatedCards: null,
      generatedCardsId: null,
      currentCard: 0,
    });

    // If there's quiz or flashcard history, fetch the full data
    if (upload.quizHistory || upload.flashcardHistory) {
      try {
        const history = await aiApi.getUploadHistory(upload.id);

        // Load quiz if available
        if (history.quizHistory) {
          useTestGeneratorStore.setState({
            generatedTest: history.quizHistory.quizzes as Quizz[],
            generatedTestId: history.quizHistory.id,
          });
        }

        // Load flashcard if available
        if (history.flashcardHistory) {
          useFlashcardGeneratorStore.setState({
            generatedCards: history.flashcardHistory.flashcards as Flashcard[],
            generatedCardsId: history.flashcardHistory.id,
          });
        }
      } catch (error) {
        console.error("Error fetching history data:", error);
      }
    }

    toast.success("Đã chọn file", {
      description: `File "${upload.filename}" đã được chọn sẵn cho cả Quiz và Flashcard.`,
    });
  },

  clearSelection: () => set({ selectedUpload: null }),
}));
