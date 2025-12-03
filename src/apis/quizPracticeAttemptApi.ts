import { api } from "./api";

// ==================== Types ====================

export interface QuizPracticeAttempt {
  id: string;
  quizSetId: string;
  userId: string;
  type: number; // 0: PRACTICE, 1: REAL
  answers: Record<string, string>;
  currentIndex: number;
  markedQuestions: string[];
  timeSpentSeconds: number;
  timeLimitMinutes: number | null;
  isSubmitted: boolean;
  score: number | null;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAttemptDto {
  quizSetId: string;
  type?: number;
  timeLimitMinutes?: number | null;
}

export interface UpdateAttemptDto {
  answers?: Record<string, string>;
  currentIndex?: number;
  markedQuestions?: string[];
  timeSpentSeconds?: number;
  timeLimitMinutes?: number | null;
}

export interface GetOrCreateAttemptResponse {
  attempt: QuizPracticeAttempt;
  isNew: boolean;
}

export interface SubmitAttemptResponse {
  message: string;
  attempt: QuizPracticeAttempt;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
}

export interface ResetAttemptResponse {
  message: string;
  attempt: QuizPracticeAttempt;
}

// ==================== API Functions ====================

/**
 * Lấy hoặc tạo phiên làm bài
 */
export async function getOrCreateAttemptApi(
  dto: CreateAttemptDto
): Promise<GetOrCreateAttemptResponse> {
  const response = await api.post("/quiz-practice-attempts", dto);
  return response.data;
}

/**
 * Lấy phiên làm bài theo quizSetId và type
 */
export async function getAttemptByQuizSetApi(
  quizSetId: string,
  type: number = 0
): Promise<QuizPracticeAttempt | null> {
  const response = await api.get(
    `/quiz-practice-attempts/by-quizset/${quizSetId}`,
    {
      params: { type },
    }
  );
  return response.data;
}

/**
 * Lấy chi tiết phiên làm bài
 */
export async function getAttemptByIdApi(
  attemptId: string
): Promise<QuizPracticeAttempt> {
  const response = await api.get(`/quiz-practice-attempts/${attemptId}`);
  return response.data;
}

/**
 * Cập nhật phiên làm bài (auto-save)
 */
export async function updateAttemptApi(
  attemptId: string,
  dto: UpdateAttemptDto
): Promise<{ message: string; attempt: QuizPracticeAttempt }> {
  const response = await api.put(`/quiz-practice-attempts/${attemptId}`, dto);
  return response.data;
}

/**
 * Nộp bài
 */
export async function submitAttemptApi(
  attemptId: string
): Promise<SubmitAttemptResponse> {
  const response = await api.post(
    `/quiz-practice-attempts/${attemptId}/submit`
  );
  return response.data;
}

/**
 * Reset để làm lại
 */
export async function resetAttemptApi(
  attemptId: string,
  timeLimitMinutes?: number | null
): Promise<ResetAttemptResponse> {
  const response = await api.post(
    `/quiz-practice-attempts/${attemptId}/reset`,
    {
      timeLimitMinutes,
    }
  );
  return response.data;
}

/**
 * Lấy tỷ lệ hoàn thành trung bình
 */
export async function getCompletionRateApi(): Promise<{
  completionRate: number;
}> {
  const response = await api.get(
    "/quiz-practice-attempts/stats/completion-rate"
  );
  return response.data;
}
