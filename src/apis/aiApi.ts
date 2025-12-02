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

export const aiApi = {
  getRecentUploads: async (limit: number = 10): Promise<RecentUpload[]> => {
    const response = await api.get(`/ai/recent-uploads?limit=${limit}`);
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

  regenerateFromUpload: async (
    uploadId: string,
    params: RegenerateParams
  ): Promise<RegenerateResponse> => {
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
};
