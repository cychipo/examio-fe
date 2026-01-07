import { api } from "./api";

// ==================== Types ====================

export interface ExamAttempt {
  id: string;
  examSessionId: string;
  userId: string;
  score: number;
  violationCount: number;
  startedAt: string;
  finishedAt: string | null;
  status: number; // 0: IN_PROGRESS, 1: COMPLETED, 2: CANCELLED
  answers: Record<string, string>;
  currentIndex: number;
  markedQuestions: string[];
  totalQuestions: number;
  correctAnswers: number;
  createdAt: string;
  updatedAt: string;
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  answer?: string; // Only present when viewing results with showAnswers
  userAnswer?: string | null; // The user's selected answer (from secure submit)
}

export interface ExamAttemptWithQuestions extends ExamAttempt {
  questions: Question[];
  timeLimitMinutes: number | null;
  creator: {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
  };
  isOwner: boolean;
  examSession: {
    id: string;
    startTime: string;
    endTime: string | null;
    showAnswersAfterSubmit: boolean;
    allowRetake: boolean;
    maxAttempts: number;
    examRoom: {
      id: string;
      title: string;
      description: string | null;
    };
  };
}

export interface StartExamAttemptResponse {
  message: string;
  examAttempt: ExamAttempt;
  isResume: boolean;
}

export interface UpdateProgressDto {
  answers?: Record<string, string>;
  currentIndex?: number;
  markedQuestions?: string[];
}

export interface SubmitExamAttemptResponse {
  message: string;
  examAttempt: ExamAttempt;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  showAnswers: boolean;
  passed: boolean;
  passingScore: number;
  questions?: Question[]; // Only if showAnswers is true
}

// ==================== API Functions ====================

/**
 * Start or resume an exam attempt
 */
export async function startExamAttemptApi(
  examSessionId: string,
  captchaToken?: string
): Promise<StartExamAttemptResponse> {
  const response = await api.post("/examattempts/start", {
    examSessionId,
    captchaToken,
  });
  return response.data;
}

/**
 * Update exam attempt progress (auto-save)
 */
export async function updateExamAttemptProgressApi(
  attemptId: string,
  data: UpdateProgressDto
): Promise<{ message: string; examAttempt: ExamAttempt }> {
  const response = await api.put(`/examattempts/${attemptId}/progress`, data);
  return response.data;
}

/**
 * Submit exam attempt and calculate score
 */
export async function submitExamAttemptApi(
  attemptId: string
): Promise<SubmitExamAttemptResponse> {
  const response = await api.post(`/examattempts/${attemptId}/submit`);
  return response.data;
}

/**
 * Get exam attempt with questions for quiz view
 */
export async function getExamAttemptForQuizApi(
  attemptId: string
): Promise<ExamAttemptWithQuestions> {
  const response = await api.get(`/examattempts/${attemptId}/quiz`);
  return response.data;
}

// ==================== Owner Endpoints ====================

export interface ExamAttemptUser {
  id: string;
  username: string;
  name: string | null;
  email: string;
  avatar: string | null;
}

export interface ExamAttemptListItem {
  id: string;
  status: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt: string | null;
  timeSpentSeconds: number;
  answers: Record<string, string>;
  user: ExamAttemptUser;
  session: {
    id: string;
    startTime: string;
    endTime: string | null;
  };
  violationCount?: number;
  attemptCount?: number; // Number of attempts by this user (when distinctUser=true)
}

export interface ExamAttemptsByRoomResponse {
  attempts: ExamAttemptListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExamAttemptDetail
  extends Omit<ExamAttemptListItem, "session"> {
  currentIndex: number;
  markedQuestions: string[];
  violationCount: number;
  session: {
    id: string;
    startTime: string;
    endTime: string | null;
  };
  examRoom: {
    id: string;
    title: string;
  };
}

/**
 * Get all exam attempts for an exam room (owner only)
 */
export async function getExamAttemptsByRoomApi(
  examRoomId: string,
  page: number = 1,
  limit: number = 10,
  distinctUser: boolean = false
): Promise<ExamAttemptsByRoomResponse> {
  const response = await api.get(`/examattempts/list-by-room/${examRoomId}`, {
    params: { page, limit, distinctUser: distinctUser.toString() },
  });
  return response.data;
}

/**
 * Get exam attempt detail for slider view (owner only)
 */
export async function getExamAttemptDetailApi(
  attemptId: string
): Promise<ExamAttemptDetail> {
  const response = await api.get(`/examattempts/${attemptId}/detail`);
  return response.data;
}

/**
 * Get all exam attempts for a specific session (owner only)
 */
export async function getExamAttemptsBySessionApi(
  sessionId: string,
  page: number = 1,
  limit: number = 50,
  distinctUser: boolean = false
): Promise<ExamAttemptsByRoomResponse> {
  const response = await api.get(`/examattempts/list-by-session/${sessionId}`, {
    params: { page, limit, distinctUser: distinctUser.toString() },
  });
  return response.data;
}

// ==================== SECURE QUIZ API ====================

/**
 * Secure question with JWT token and encrypted content
 */
export interface SecureQuestion {
  index: number;
  token: string;
  question_encrypted: string;
  options_encrypted: string;
}

/**
 * Secure quiz response with encrypted questions
 */
export interface SecureQuizResponse {
  attemptId: string;
  status: number;
  currentIndex: number;
  answers: Record<string, string>;
  markedQuestions: string[];
  totalQuestions: number;
  timeLimitMinutes: number | null;
  startedAt: string;
  questions: SecureQuestion[];
}

/**
 * Answer with JWT token for verification
 */
export interface SecureAnswer {
  token: string;
  chosen_option: string;
}

/**
 * Secure submit response
 */
export interface SecureSubmitResponse {
  message: string;
  examAttempt: {
    id: string;
    status: number;
    score: number;
    finishedAt: string;
  };
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  showAnswers: boolean;
  passed: boolean;
  passingScore: number;
  questions?: Array<{
    id: string;
    question: string;
    options: string[];
    answer: string;
    userAnswer: string | null;
  }>;
}

/**
 * Get secure quiz with encrypted questions and JWT tokens
 * Use this for the actual exam taking
 */
export async function getSecureQuizApi(
  attemptId: string
): Promise<SecureQuizResponse> {
  const response = await api.get(`/examattempts/${attemptId}/secure-quiz`);
  return response.data;
}

/**
 * Submit exam with JWT token verification
 * Each answer must include the question's JWT token
 */
export async function submitSecureQuizApi(
  attemptId: string,
  answers: SecureAnswer[]
): Promise<SecureSubmitResponse> {
  const response = await api.post(`/examattempts/${attemptId}/secure-submit`, {
    answers,
  });
  return response.data;
}
