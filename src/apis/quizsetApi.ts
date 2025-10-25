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

export type ResponseSetQuizzesToQuizset = {
  message?: string;
  createdCount: number;
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
  credentials: CredentialsQuizSet
): Promise<ResponseCreateQuizset> {
  const response = await api.post("/quizsets", credentials);
  return response.data;
}

export async function getQuizSetsApi(
  credentials: CredentialsGetQuizsets
): Promise<ResponseListQuizsets> {
  const response = await api.get("/quizsets/list", {
    params: credentials,
  });
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
