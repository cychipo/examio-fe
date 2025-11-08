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
 * Sử dụng endpoint bulk add với 1 flashcard
 */
export async function addFlashcardToFlashcardSet(
  flashcardSetId: string,
  flashcardData: CreateFlashcardData
): Promise<ResponseSetFlashcardsToFlashcardSet> {
  const response = await api.post(
    "/flashcardsets/set-flashcards-to-flashcardset",
    {
      flashcardsetIds: [flashcardSetId],
      flashcards: [flashcardData],
    } as CredentialsSetFlashcardsToFlashcardSet
  );
  return response.data;
}

/**
 * Cập nhật flashcard trong flashcard set
 * Note: Backend cần có endpoint PUT /flashcardsets/:flashcardSetId/flashcards/:flashcardId
 * Tạm thời sử dụng workaround: xóa và thêm lại
 */
export async function updateFlashcardInFlashcardSet(
  _flashcardSetId: string,
  _flashcardId: string,
  _flashcardData: UpdateFlashcardData
): Promise<{ success: boolean }> {
  // TODO: Implement proper update endpoint when available
  // For now, this is a placeholder
  console.warn("Update flashcard API not implemented yet");
  return { success: true };
}

/**
 * Xóa flashcard khỏi flashcard set
 * Note: Backend cần có endpoint DELETE /flashcardsets/:flashcardSetId/flashcards/:flashcardId
 */
export async function deleteFlashcardFromFlashcardSet(
  _flashcardSetId: string,
  _flashcardId: string
): Promise<{ success: boolean }> {
  // TODO: Implement proper delete endpoint when available
  // For now, this is a placeholder
  console.warn("Delete flashcard API not implemented yet");
  return { success: true };
}
