import { api } from "./api";

// ==================== Types ====================

export interface HistoryStats {
  totalPDFs: number;
  examsCreated: number;
  flashcardSets: number;
  totalStudyHours: number;
}

export interface PDFHistoryItem {
  id: string;
  filename: string;
  url: string;
  size: number;
  mimetype: string;
  createdAt: string;
  processingStatus: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  quizHistory: {
    id: string;
    quizzes: unknown[];
    createdAt: string;
  } | null;
  flashcardHistory: {
    id: string;
    flashcards: unknown[];
    createdAt: string;
  } | null;
}

export interface ExamHistoryItem {
  id: string;
  examSessionId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt: string | null;
  status: number;
  examSession: {
    id: string;
    startTime: string;
    endTime: string | null;
    examRoom: {
      id: string;
      title: string;
      quizSet: {
        id: string;
        title: string;
        thumbnail: string | null;
      };
    };
  };
}

export interface ExamHistoryResponse {
  examAttempts: ExamHistoryItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== API Functions ====================

/**
 * Get aggregated history statistics
 * Cached on backend for 5 minutes
 */
export async function getHistoryStatsApi(): Promise<HistoryStats> {
  const response = await api.get("/examattempts/history-stats");
  return response.data;
}

/**
 * Get PDF processing history (recent uploads)
 */
export async function getPDFHistoryApi(
  limit: number = 10
): Promise<PDFHistoryItem[]> {
  const response = await api.get(`/ai/recent-uploads?limit=${limit}`);
  // API returns paginated response {data: [], total, page, size}, extract data array
  return response.data.data || response.data;
}

/**
 * Get exam history with pagination
 */
export async function getExamHistoryApi(
  page: number = 1,
  limit: number = 10
): Promise<ExamHistoryResponse> {
  const response = await api.get("/examattempts/list", {
    params: { page, limit },
  });
  return response.data;
}
