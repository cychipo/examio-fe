import { api } from "./api";

// Cheating types - must match BE enum
export enum CHEATING_TYPE {
  TAB_SWITCH = "TAB_SWITCH",
  WINDOW_BLUR = "WINDOW_BLUR",
  DEVTOOLS_OPEN = "DEVTOOLS_OPEN",
  COPY_PASTE = "COPY_PASTE",
  RIGHT_CLICK = "RIGHT_CLICK",
  FULLSCREEN_EXIT = "FULLSCREEN_EXIT",
  PRINT_SCREEN = "PRINT_SCREEN",
}

export const CHEATING_TYPE_LABELS: Record<CHEATING_TYPE, string> = {
  [CHEATING_TYPE.TAB_SWITCH]: "Chuyển tab",
  [CHEATING_TYPE.WINDOW_BLUR]: "Rời cửa sổ",
  [CHEATING_TYPE.DEVTOOLS_OPEN]: "Mở DevTools",
  [CHEATING_TYPE.COPY_PASTE]: "Sao chép/dán",
  [CHEATING_TYPE.RIGHT_CLICK]: "Click phải",
  [CHEATING_TYPE.FULLSCREEN_EXIT]: "Thoát fullscreen",
  [CHEATING_TYPE.PRINT_SCREEN]: "Chụp màn hình",
};

export interface CheatingLog {
  id: string;
  examAttemptId: string;
  type: CHEATING_TYPE;
  count: number;
  description?: string;
  lastOccurredAt: string;
  createdAt: string;
}

export interface CheatingSessionStats {
  type: string;
  description: string;
  totalCount: number;
  affectedAttempts: number;
}

export interface LogViolationResponse {
  logged: boolean;
  type?: CHEATING_TYPE;
  count?: number;
  totalViolations?: number;
  message?: string;
}

/**
 * Log a cheating violation
 */
export async function logCheatingViolationApi(
  examAttemptId: string,
  type: CHEATING_TYPE
): Promise<LogViolationResponse> {
  const response = await api.post("/cheatinglogs", {
    examAttemptId,
    type,
  });
  return response.data;
}

/**
 * Get cheating logs for an attempt (host only)
 */
export async function getCheatingLogsApi(
  attemptId: string
): Promise<CheatingLog[]> {
  const response = await api.get(`/cheatinglogs/attempt/${attemptId}`);
  return response.data;
}

/**
 * Get cheating stats for a session (host only)
 */
export async function getSessionCheatingStatsApi(
  sessionId: string
): Promise<CheatingSessionStats[]> {
  const response = await api.get(`/cheatinglogs/session/${sessionId}/stats`);
  return response.data;
}

// Types for user attempts with logs
export interface UserAttemptWithLogs {
  id: string;
  status: number;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  startedAt: string;
  finishedAt: string | null;
  violationCount: number;
  timeSpentSeconds: number;
  cheatingLogs: Array<{
    id: string;
    type: string;
    description: string;
    count: number;
    lastOccurredAt: string;
  }>;
}

export interface UserAttemptsWithLogsResponse {
  attempts: UserAttemptWithLogs[];
  aggregatedLogs: Array<{
    type: string;
    description: string;
    totalCount: number;
  }>;
}

/**
 * Get all attempts for a user in a session with cheating logs (host only)
 * Optimized single API call instead of N+1 calls
 */
export async function getUserAttemptsWithLogsApi(
  sessionId: string,
  userId: string
): Promise<UserAttemptsWithLogsResponse> {
  const response = await api.get(
    `/cheatinglogs/session/${sessionId}/user/${userId}`
  );
  return response.data;
}
