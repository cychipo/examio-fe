import { api } from "./api";
import { Quizz, Flashcard } from "@/types/exam";

export interface RecentUpload {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  quizHistory: {
    id: string;
    quizzes: Quizz[];
    createdAt: string;
  } | null;
  flashcardHistory: {
    id: string;
    flashcards: Flashcard[];
    createdAt: string;
  } | null;
}

export interface UploadDetail {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
  quizHistories: {
    id: string;
    quizzes: Quizz[];
    createdAt: string;
  }[];
  flashcardHistories: {
    id: string;
    flashcards: Flashcard[];
    createdAt: string;
  }[];
}

export interface RegenerateParams {
  typeResult: number; // 0 = flashcard, 1 = quiz
  quantityFlashcard?: number;
  quantityQuizz?: number;
  isNarrowSearch?: boolean;
  keyword?: string;
  modelType?: string; // 'gemini' or 'fayedark'
}

export interface RegenerateResponse {
  type: "flashcard" | "quiz";
  quizzes?: Quizz[];
  flashcards?: Flashcard[];
  historyId?: string;
  fileInfo: {
    id: string;
    filename: string;
  };
}

// Job response when creating regenerate job
export interface JobCreateResponse {
  jobId: string;
  newBalance?: number;
}

export const aiApi = {
  /**
   * Get recent uploads with optional quiz/flashcard history
   * @param limit - Number of items to fetch
   * @param includeHistory - Whether to include quiz/flashcard history (default: true)
   */
  getRecentUploads: async (
    limit: number = 10,
    includeHistory: boolean = true
  ): Promise<RecentUpload[]> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      ...(includeHistory === false && { includeHistory: "false" }),
    });
    const response = await api.get(`/ai/recent-uploads?${params}`);
    return response.data;
  },

  getUploadDetail: async (uploadId: string): Promise<UploadDetail> => {
    const response = await api.get(`/ai/upload/${uploadId}`);
    return response.data;
  },

  deleteUpload: async (
    uploadId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/ai/upload/${uploadId}`);
    return response.data;
  },

  // This now returns jobId and uses job queue (same as file upload)
  regenerateFromUpload: async (
    uploadId: string,
    params: RegenerateParams
  ): Promise<JobCreateResponse> => {
    const response = await api.post(`/ai/regenerate/${uploadId}`, params);
    return response.data;
  },

  getJobStatus: async (
    jobId: string
  ): Promise<{
    jobId: string;
    status: string;
    progress?: number;
    message?: string;
    error?: string;
    result?: {
      type: string;
      quizzes?: any[];
      flashcards?: any[];
      historyId?: string;
      fileInfo?: {
        id: string;
        filename: string;
      };
    };
  }> => {
    const response = await api.get(`/ai/job/${jobId}`);
    return response.data;
  },

  cancelJob: async (
    jobId: string
  ): Promise<{ success: boolean; message: string }> => {
    const response = await api.delete(`/ai/job/${jobId}`);
    return response.data;
  },

  /**
   * Get full quiz and flashcard history for an upload
   * Used when selecting a recent file to load previous results
   */
  getUploadHistory: async (
    uploadId: string
  ): Promise<{
    uploadId: string;
    filename: string;
    quizHistory: { id: string; quizzes: Quizz[]; createdAt: string } | null;
    flashcardHistory: {
      id: string;
      flashcards: Flashcard[];
      createdAt: string;
    } | null;
  }> => {
    const response = await api.get(`/ai/upload/${uploadId}/history`);
    return response.data;
  },
};
