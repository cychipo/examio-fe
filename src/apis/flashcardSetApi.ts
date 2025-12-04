import { api } from "./api";
import {
  FlashcardSet,
  Flashcard,
  FlashcardSetPublicInfo,
  AccessCheckResult,
  SharingSettings,
} from "@/types/flashcardSet";

export type CredentialsFlashcardSet = Omit<
  FlashcardSet,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "userId"
  | "viewCount"
  | "accessCode"
  | "whitelist"
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
  credentials: CredentialsFlashcardSet,
  thumbnailFile?: File
): Promise<ResponseCreateFlashcardSet> {
  // If thumbnail file is provided, use FormData
  if (thumbnailFile) {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);
    formData.append("title", credentials.title);
    if (credentials.description)
      formData.append("description", credentials.description);
    if (credentials.isPublic !== undefined)
      formData.append("isPublic", String(credentials.isPublic));
    if (credentials.tags)
      formData.append("tags", JSON.stringify(credentials.tags));

    const response = await api.post("/flashcardsets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // Otherwise use JSON
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
  totalViews: number;
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
  credentials: Partial<CredentialsFlashcardSet>,
  thumbnailFile?: File
): Promise<ResponseCreateFlashcardSet> {
  // If thumbnail file is provided, use FormData
  if (thumbnailFile) {
    const formData = new FormData();
    formData.append("thumbnail", thumbnailFile);
    if (credentials.title) formData.append("title", credentials.title);
    if (credentials.description)
      formData.append("description", credentials.description);
    if (credentials.isPublic !== undefined)
      formData.append("isPublic", String(credentials.isPublic));
    if (credentials.tags)
      formData.append("tags", JSON.stringify(credentials.tags));

    const response = await api.put(`/flashcardsets/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  }

  // Otherwise use JSON (only send changed fields)
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

// ========== SHARING & ACCESS OPERATIONS ==========

/**
 * Check access for a flashcard set (public endpoint)
 */
export async function checkFlashcardSetAccess(
  id: string
): Promise<AccessCheckResult> {
  const response = await api.get(`/flashcardsets/study/${id}/access`);
  return response.data;
}

/**
 * Get public info for a flashcard set
 */
export async function getFlashcardSetPublicInfo(
  id: string
): Promise<FlashcardSetPublicInfo> {
  const response = await api.get(`/flashcardsets/study/${id}/info`);
  return response.data;
}

/**
 * Get flashcard set for study (with access check)
 */
export async function getFlashcardSetForStudy(
  id: string,
  accessCode?: string
): Promise<
  FlashcardSet & { creator: { name: string; avatar: string | null } }
> {
  if (!accessCode) {
    const response = await api.get(`/flashcardsets/study/${id}`);
    return response.data;
  } else {
    const response = await api.post(`/flashcardsets/study/${id}/with-code`, {
      accessCode,
    });
    return response.data;
  }
}

/**
 * Verify access code for a private flashcard set
 */
export async function verifyFlashcardSetAccessCode(
  id: string,
  accessCode: string
): Promise<{ valid: boolean; message: string }> {
  const response = await api.post(`/flashcardsets/study/${id}/verify-code`, {
    accessCode,
  });
  return response.data;
}

/**
 * Get flashcard set using access code
 */
export async function getFlashcardSetWithCode(
  id: string,
  accessCode: string
): Promise<FlashcardSet> {
  const response = await api.post(`/flashcardsets/study/${id}/with-code`, {
    accessCode,
  });
  return response.data;
}

/**
 * Get sharing settings for a flashcard set (owner only)
 */
export async function getSharingSettings(id: string): Promise<SharingSettings> {
  const response = await api.get(`/flashcardsets/${id}/sharing`);
  return response.data;
}

/**
 * Update sharing settings for a flashcard set
 */
export async function updateSharingSettings(
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
  const response = await api.put(`/flashcardsets/${id}/sharing`, settings);
  return response.data;
}

/**
 * Generate a new access code for a flashcard set
 */
export async function generateAccessCode(
  id: string
): Promise<{ accessCode: string }> {
  const response = await api.post(`/flashcardsets/${id}/generate-code`);
  return response.data;
}

/**
 * Search user type for whitelist
 */
export type SearchUser = {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
  email: string;
};

/**
 * Search users by username for whitelist
 */
export async function searchUsersForWhitelist(
  query: string
): Promise<SearchUser[]> {
  if (!query || query.length < 2) {
    return [];
  }
  const response = await api.get(`/flashcardsets/users/search`, {
    params: { q: query },
  });
  return response.data;
}
