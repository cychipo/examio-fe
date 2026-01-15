import { api } from "./api";

// ==================== Types ====================

export interface RecentFlashcardSet {
  id: string;
  title: string;
  description: string | null;
  thumbnail: string | null;
  viewCount: number;
  flashcardCount: number;
  lastViewedAt: string;
  createdAt: string;
  creator: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  isPublic: boolean;
  progress?: number; // Percentage of cards studied
}

export interface RecentExamAttempt {
  id: string;
  examSessionId: string;
  score: number;
  violationCount: number;
  startedAt: string;
  finishedAt: string | null;
  status: number; // 0: IN_PROGRESS, 1: COMPLETED, 2: CANCELLED
  totalQuestions: number;
  correctAnswers: number;
  timeRemaining: number | null; // Minutes remaining if in progress
  examSession: {
    id: string;
    startTime: string;
    endTime: string | null;
    timeLimitMinutes: number | null;
    showAnswersAfterSubmit: boolean;
    examRoom: {
      id: string;
      title: string;
      description: string | null;
    };
  };
}

export interface RecentMaterialsResponse {
  flashcardSets: RecentFlashcardSet[];
  total: number;
}

export interface RecentExamsResponse {
  examAttempts: RecentExamAttempt[];
  total: number;
}

// ==================== API Functions ====================

/**
 * Get recent flashcard sets viewed/studied by student
 */
export async function getRecentFlashcardSetsApi(
  limit: number = 10
): Promise<RecentMaterialsResponse> {
  const response = await api.get("/student/recent-flashcards", {
    params: { limit },
  });
  return response.data;
}

/**
 * Get recent exam attempts (both exam room and practice)
 */
export async function getRecentExamAttemptsApi(
  limit: number = 10
): Promise<RecentExamsResponse> {
  const response = await api.get("/student/recent-exams", {
    params: { limit },
  });
  return response.data;
}

/**
 * Generate share link for flashcard set
 */
export async function generateShareLinkApi(
  flashcardSetId: string
): Promise<{ shareUrl: string; accessCode: string }> {
  const response = await api.post(`/flashcardsets/${flashcardSetId}/share`);
  return response.data;
}
