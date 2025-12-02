import { api } from "./api";
import { FlashcardSet, Flashcard } from "@/types/flashcardSet";

export type CredentialsFlashcardSet = Omit<
  FlashcardSet,
  "id" | "createdAt" | "updatedAt" | "userId"
>;

export type CredentialsSetFlashcardsToFlashcardSet = {
  flashcardsetIds: string[];
  flashcards: Omit<Flashcard, "id" | "createdAt" | "updatedAt">[];
};

export type CredentialSetHistoryToFlashcardSet = {
  flashcardsetIds: string[];
  historyId: string;
};

export type ResponseSetFlashcardsToFlashcardSet = {
  message?: string;
  createdCount: number;
};

export type CredentialsGetFlashcardSets = {
  page: number;
  limit: number;
  search?: string;
  tags?: string[];
  isPublic?: boolean;
  isPinned?: boolean;
};

export type ResponseListFlashcardSets = {
  flashcardSets: Omit<FlashcardSet, "flashcards">[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type ResponseCreateFlashcardSet = {
  flashcardSet: Omit<FlashcardSet, "flashcards">;
};

export async function createFlashcardSetApi(
  credentials: CredentialsFlashcardSet
): Promise<ResponseCreateFlashcardSet> {
  const response = await api.post("/flashcardsets", credentials);
  return response.data;
}

export async function getFlashcardSetsApi(
  credentials: CredentialsGetFlashcardSets
): Promise<ResponseListFlashcardSets> {
  const response = await api.get("/flashcardsets/", {
    params: credentials,
  });
  return response.data;
}

export type ResponseFlashcardSetStats = {
  totalGroups: number;
  totalCards: number;
  avgProgress: number;
  studiedToday: number;
};

export async function getFlashcardSetStatsApi(): Promise<ResponseFlashcardSetStats> {
  const response = await api.get("/flashcardsets/stats");
  return response.data;
}

export async function setFlashcardsToFlashcardSet(
  credentials: CredentialsSetFlashcardsToFlashcardSet
): Promise<ResponseSetFlashcardsToFlashcardSet> {
  const response = await api.post(
    "/flashcardsets/set-flashcards-to-flashcardset",
    credentials
  );
  return response.data;
}

export async function setHistoryFlashcardsToFlashcardSet(
  credentials: CredentialSetHistoryToFlashcardSet
): Promise<ResponseSetFlashcardsToFlashcardSet> {
  const response = await api.post(
    "/flashcardsets/save-history-to-flashcardset",
    credentials
  );
  return response.data;
}

export type ResponseDeleteFlashcardSet = {
  message: string;
};

export async function deleteFlashcardSetApi(
  id: string
): Promise<ResponseDeleteFlashcardSet> {
  const response = await api.delete(`/flashcardsets/${id}`);
  return response.data;
}

export async function getFlashcardSetByIdApi(
  id: string
): Promise<FlashcardSet> {
  const response = await api.get(`/flashcardsets/${id}`);
  return response.data;
}

export async function updateFlashcardSetApi(
  id: string,
  credentials: CredentialsFlashcardSet
): Promise<ResponseCreateFlashcardSet> {
  const response = await api.put(`/flashcardsets/${id}`, credentials);
  return response.data;
}

// ========== FLASHCARD CRUD OPERATIONS ==========

export type CreateFlashcardData = {
  question: string;
  answer: string;
};

export type UpdateFlashcardData = CreateFlashcardData;

export type ResponseFlashcard = {
  flashcard: Flashcard;
};

/**
 * Thêm flashcard vào flashcard set
 */
export async function addFlashcardToFlashcardSet(
  flashcardSetId: string,
  flashcardData: CreateFlashcardData
): Promise<{ message: string; flashcard: Flashcard }> {
  const response = await api.post(
    `/flashcardsets/${flashcardSetId}/flashcards`,
    flashcardData
  );
  return response.data;
}

/**
 * Cập nhật flashcard trong flashcard set
 */
export async function updateFlashcardInFlashcardSet(
  flashcardSetId: string,
  flashcardId: string,
  flashcardData: UpdateFlashcardData
): Promise<{ message: string; flashcard: Flashcard }> {
  const response = await api.put(
    `/flashcardsets/${flashcardSetId}/flashcards/${flashcardId}`,
    flashcardData
  );
  return response.data;
}

/**
 * Xóa flashcard khỏi flashcard set
 */
export async function deleteFlashcardFromFlashcardSet(
  flashcardSetId: string,
  flashcardId: string
): Promise<{ message: string }> {
  const response = await api.delete(
    `/flashcardsets/${flashcardSetId}/flashcards/${flashcardId}`
  );
  return response.data;
}
