import { api } from "./api";
import {
  ExamSession,
  EXAM_SESSION_STATUS,
  ASSESS_TYPE,
  AccessCheckResult,
  ExamSessionPublicInfo,
  ExamSessionForStudy,
  SharingSettings,
} from "@/types/examSession";

export type CredentialsCreateExamSession = {
  examRoomId: string;
  startTime: string;
  endTime?: string;
  autoJoinByLink?: boolean;
  assessType?: ASSESS_TYPE;
  allowRetake?: boolean;
  maxAttempts?: number;
  accessCode?: string | null;
  whitelist?: string[];
  showAnswersAfterSubmit?: boolean;
};

export type CredentialsUpdateExamSession = {
  status?: EXAM_SESSION_STATUS;
  startTime?: string;
  endTime?: string;
  autoJoinByLink?: boolean;
  assessType?: ASSESS_TYPE;
  allowRetake?: boolean;
  maxAttempts?: number;
  accessCode?: string | null;
  whitelist?: string[];
  showAnswersAfterSubmit?: boolean;
};

export type CredentialsGetExamSessions = {
  page: number;
  limit: number;
  examRoomId?: string;
  status?: EXAM_SESSION_STATUS;
};

export type ResponseListExamSessions = {
  examSessions: ExamSession[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ResponseCreateExamSession = {
  examSession: ExamSession;
};

export type ResponseUpdateExamSession = {
  examSession: ExamSession;
};

export type ResponseDeleteExamSession = {
  message: string;
};

export async function createExamSessionApi(
  credentials: CredentialsCreateExamSession
): Promise<ResponseCreateExamSession> {
  const response = await api.post("/examsessions", credentials);
  return response.data;
}

export async function getExamSessionsApi(
  credentials: CredentialsGetExamSessions
): Promise<ResponseListExamSessions> {
  const response = await api.get("/examsessions/list", {
    params: credentials,
  });
  return response.data;
}

export async function getExamSessionByIdApi(id: string): Promise<ExamSession> {
  const response = await api.get(`/examsessions/get-by-id/${id}`);
  return response.data;
}

export async function updateExamSessionApi(
  id: string,
  credentials: CredentialsUpdateExamSession
): Promise<ResponseUpdateExamSession> {
  const response = await api.put(`/examsessions/${id}`, credentials);
  return response.data;
}

export async function deleteExamSessionApi(
  id: string
): Promise<ResponseDeleteExamSession> {
  const response = await api.delete(`/examsessions/${id}`);
  return response.data;
}

export async function getPublicExamSessionByIdApi(
  id: string
): Promise<ExamSession> {
  const response = await api.get(`/examsessions/get-public/${id}`);
  return response.data;
}

// ==================== ACCESS CONTROL APIs ====================

export async function checkExamSessionAccessApi(
  id: string
): Promise<AccessCheckResult> {
  const response = await api.get(`/examsessions/study/${id}/access`);
  return response.data;
}

export async function getExamSessionPublicInfoApi(
  id: string
): Promise<ExamSessionPublicInfo> {
  const response = await api.get(`/examsessions/study/${id}/info`);
  return response.data;
}

export async function getExamSessionForStudyApi(
  id: string,
  accessCode?: string
): Promise<ExamSessionForStudy> {
  if (accessCode) {
    const response = await api.post(`/examsessions/study/${id}/with-code`, {
      accessCode,
    });
    return response.data;
  }
  const response = await api.get(`/examsessions/study/${id}`);
  return response.data;
}

export async function verifyExamSessionAccessCodeApi(
  id: string,
  accessCode: string
): Promise<{ valid: boolean; message: string }> {
  const response = await api.post(`/examsessions/study/${id}/verify-code`, {
    accessCode,
  });
  return response.data;
}

// ==================== SHARING APIs ====================

export async function getExamSessionSharingSettingsApi(
  id: string
): Promise<SharingSettings> {
  const response = await api.get(`/examsessions/${id}/sharing`);
  return response.data;
}

export async function updateExamSessionSharingSettingsApi(
  id: string,
  settings: {
    isPublic: boolean;
    accessCode?: string | null;
    whitelist?: string[];
  }
): Promise<{
  message: string;
  isPublic: boolean;
  accessCode: string | null;
  whitelist: string[];
}> {
  const response = await api.put(`/examsessions/${id}/sharing`, settings);
  return response.data;
}

export async function generateExamSessionAccessCodeApi(
  id: string
): Promise<{ accessCode: string }> {
  const response = await api.post(`/examsessions/${id}/generate-code`);
  return response.data;
}

export async function searchUsersForWhitelistApi(query: string): Promise<
  {
    id: string;
    username: string;
    name: string | null;
    avatar: string | null;
    email: string;
  }[]
> {
  const response = await api.get("/examsessions/users/search", {
    params: { q: query },
  });
  return response.data;
}
