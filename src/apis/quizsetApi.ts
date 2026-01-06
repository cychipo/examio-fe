import { api } from "./api";
import { QuizSet, Quizz } from "@/types/quizset";

export type CredentialsQuizSet = Omit<
  QuizSet,
  "id" | "createdAt" | "updatedAt" | "userId"
>;

export type CredentialsSetQuizToQuizset = {
  quizsetIds: string[];
  quizzes: Omit<Quizz, "id" | "quizSetId" | "createdAt" | "updatedAt">[];
};

export type CredentialSetHistoryToQuizset = {
  quizsetIds: string[];
  historyId: string;
  labelId?: string; // Existing label ID to assign questions to
  labelName?: string; // Create new label with this name
  labelColor?: string; // Color for new label
};

export type ResponseSetQuizzesToQuizset = {
  message?: string;
  createdCount: number;
  updatedCount?: number;
  skippedCount?: number;
};

export type CredentialsGetQuizsets = {
  page: number;
  limit: number;
  search?: string;
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
};

export type ResponseListQuizsets = {
  quizSets: Omit<QuizSet, "questions">[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ResponseCreateQuizset = {
  quizSet: Omit<QuizSet, "questions">;
};

export async function createQuizSetApi(
  credentials: CredentialsQuizSet,
  thumbnailFile?: File
): Promise<ResponseCreateQuizset> {
  // If thumbnail file is provided, use FormData
  if (thumbnailFile) {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);
    formData.append("title", credentials.title);
    if (credentials.description)
      formData.append("description", credentials.description);
    if (credentials.isPublic !== undefined)
      formData.append("isPublic", String(credentials.isPublic));
    if (credentials.isPinned !== undefined)
      formData.append("isPinned", String(credentials.isPinned));
    if (credentials.tags)
      formData.append("tags", JSON.stringify(credentials.tags));

    const response = await api.post("/quizsets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // Otherwise use JSON
  const response = await api.post("/quizsets", credentials);
  return response.data;
}

export async function getQuizSetsApi(
  credentials: CredentialsGetQuizsets
): Promise<ResponseListQuizsets> {
  const response = await api.get("/quizsets", {
    params: credentials,
  });
  return response.data;
}

export type ResponseQuizSetStats = {
  totalExams: number;
  activeExams: number;
  totalQuestions: number;
  completionRate: number;
};

export async function getQuizSetStatsApi(): Promise<ResponseQuizSetStats> {
  const response = await api.get("/quizsets/stats");
  return response.data;
}

export async function setQuizzesToQuizset(
  credentials: CredentialsSetQuizToQuizset
): Promise<ResponseSetQuizzesToQuizset> {
  const response = await api.post(
    "/quizsets/set-quizzes-to-quizset",
    credentials
  );
  return response.data;
}

export async function setHistoryQuizzesToQuizset(
  credentials: CredentialSetHistoryToQuizset
): Promise<ResponseSetQuizzesToQuizset> {
  const response = await api.post(
    `/quizsets/save-history-to-quizset`,
    credentials
  );
  return response.data;
}

export type ResponseDeleteQuizset = {
  message: string;
};

export async function deleteQuizSetApi(
  id: string
): Promise<ResponseDeleteQuizset> {
  const response = await api.delete(`/quizsets/${id}`);
  return response.data;
}

export type ResponseListAllQuizsets = {
  quizSets: Omit<QuizSet, "questions">[];
};

export async function getAllQuizSetsApi(): Promise<ResponseListAllQuizsets> {
  const response = await api.get("/quizsets/list/all");
  return response.data;
}

export async function getQuizSetByIdApi(id: string): Promise<QuizSet> {
  const response = await api.get(`/quizsets/${id}`);
  return response.data;
}

// Pagination types
export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ResponseQuizSetQuestions {
  questions: Quizz[];
  pagination: PaginationInfo;
}

/**
 * Get paginated questions for a quiz set
 * @param id Quiz set ID
 * @param page Page number (default: 1)
 * @param limit Items per page (default: 10)
 */
export async function getQuizSetQuestionsApi(
  id: string,
  page: number = 1,
  limit: number = 10
): Promise<ResponseQuizSetQuestions> {
  const response = await api.get(`/quizsets/${id}/questions`, {
    params: { page, limit },
  });
  return response.data;
}

export async function updateQuizSetApi(
  id: string,
  credentials: Partial<CredentialsQuizSet>,
  thumbnailFile?: File
): Promise<ResponseCreateQuizset> {
  // If thumbnail file is provided, use FormData
  if (thumbnailFile) {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);
    if (credentials.title) formData.append("title", credentials.title);
    if (credentials.description)
      formData.append("description", credentials.description);
    if (credentials.isPublic !== undefined)
      formData.append("isPublic", String(credentials.isPublic));
    if (credentials.isPinned !== undefined)
      formData.append("isPinned", String(credentials.isPinned));
    if (credentials.tags)
      formData.append("tags", JSON.stringify(credentials.tags));

    const response = await api.put(`/quizsets/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // Otherwise use JSON (only send changed fields)
  const response = await api.put(`/quizsets/${id}`, credentials);
  return response.data;
}

// ==================== CRUD Questions ====================

export type CreateQuestionData = {
  question: string;
  options: string[];
  answer: string;
  labelId?: string | null;
};

export type UpdateQuestionData = CreateQuestionData;

export type ResponseQuestion = {
  message: string;
  question: Quizz;
};

/**
 * Thêm câu hỏi mới vào quiz set
 */
export async function addQuestionToQuizSet(
  quizSetId: string,
  questionData: CreateQuestionData
): Promise<ResponseQuestion> {
  const response = await api.post(
    `/quizsets/${quizSetId}/questions`,
    questionData
  );
  return response.data;
}

/**
 * Cập nhật câu hỏi trong quiz set
 */
export async function updateQuestionInQuizSet(
  quizSetId: string,
  questionId: string,
  questionData: UpdateQuestionData
): Promise<ResponseQuestion> {
  const response = await api.put(
    `/quizsets/${quizSetId}/questions/${questionId}`,
    questionData
  );
  return response.data;
}

/**
 * Xóa câu hỏi khỏi quiz set
 */
export async function deleteQuestionFromQuizSet(
  quizSetId: string,
  questionId: string
): Promise<{ message: string }> {
  const response = await api.delete(
    `/quizsets/${quizSetId}/questions/${questionId}`
  );
  return response.data;
}

// ==================== Labels API ====================

export interface QuizSetLabel {
  id: string;
  quizSetId: string;
  name: string;
  description?: string | null;
  color?: string | null;
  order: number;
  questionCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResponseLabels {
  labels: QuizSetLabel[];
  unlabeledCount: number;
}

export interface CreateLabelData {
  name: string;
  description?: string;
  color?: string;
  order?: number;
}

export interface UpdateLabelData {
  name?: string;
  description?: string | null;
  color?: string | null;
  order?: number;
}

/**
 * Get all labels for a quiz set
 */
export async function getQuizSetLabelsApi(
  quizSetId: string
): Promise<ResponseLabels> {
  const response = await api.get(`/quizsets/${quizSetId}/labels`);
  return response.data;
}

/**
 * Create a new label for a quiz set
 */
export async function createLabelApi(
  quizSetId: string,
  data: CreateLabelData
): Promise<{ message: string; label: QuizSetLabel }> {
  const response = await api.post(`/quizsets/${quizSetId}/labels`, data);
  return response.data;
}

/**
 * Update a label
 */
export async function updateLabelApi(
  quizSetId: string,
  labelId: string,
  data: UpdateLabelData
): Promise<{ message: string; label: QuizSetLabel }> {
  const response = await api.put(
    `/quizsets/${quizSetId}/labels/${labelId}`,
    data
  );
  return response.data;
}

/**
 * Delete a label
 */
export async function deleteLabelApi(
  quizSetId: string,
  labelId: string
): Promise<{ message: string }> {
  const response = await api.delete(`/quizsets/${quizSetId}/labels/${labelId}`);
  return response.data;
}

/**
 * Assign questions to a label
 */
export async function assignQuestionsToLabelApi(
  quizSetId: string,
  labelId: string,
  questionIds: string[]
): Promise<{ message: string; updatedCount: number }> {
  const response = await api.post(
    `/quizsets/${quizSetId}/labels/${labelId}/questions`,
    { questionIds }
  );
  return response.data;
}

/**
 * Get questions by label (paginated)
 */
export async function getQuestionsByLabelApi(
  quizSetId: string,
  labelId: string | null,
  page: number = 1,
  limit: number = 100
): Promise<ResponseQuizSetQuestions> {
  const actualLabelId = labelId === null ? "unlabeled" : labelId;
  const response = await api.get(
    `/quizsets/${quizSetId}/labels/${actualLabelId}/questions`,
    {
      params: { page, limit },
    }
  );
  return response.data;
}
