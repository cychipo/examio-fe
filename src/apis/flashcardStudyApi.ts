import { api } from "./api";
import {
  FlashcardStudySession,
  FlashcardSetProgress,
  Flashcard,
} from "@/types/flashcardSet";

// Study modes
export const STUDY_MODE = {
  LEARN: 0,
  REVIEW: 1,
  MIXED: 2,
} as const;

export type StudyMode = (typeof STUDY_MODE)[keyof typeof STUDY_MODE];

// DTO Types
export interface CreateStudySessionDto {
  flashCardSetId: string;
  studyMode?: StudyMode;
}

export interface UpdateStudySessionDto {
  cardsStudied?: number;
  correctCount?: number;
  incorrectCount?: number;
  timeSpentSeconds?: number;
  isCompleted?: boolean;
}

export interface ReviewCardDto {
  flashCardId: string;
  quality: number; // 0-5
}

export interface CompleteSessionDto {
  timeSpentSeconds?: number;
  cardsStudied?: number;
  correctCount?: number;
  incorrectCount?: number;
}

// Response Types
export interface CardReviewInfo {
  flashCardId: string;
  quality: number;
}

export interface GetOrCreateSessionResponse {
  session: FlashcardStudySession;
  isNew: boolean;
  reviews: CardReviewInfo[]; // Reviews to restore studied cards state
}

export interface UpdateSessionResponse {
  message: string;
  session: FlashcardStudySession;
}

export interface CompleteSessionResponse {
  message: string;
  session: FlashcardStudySession;
}

export interface ReviewCardResponse {
  message: string;
  review: {
    id: string;
    quality: number;
    easeFactor: number;
    interval: number;
    repetitions: number;
    nextReviewDate: string;
  };
}

export interface GetCardsForStudyResponse {
  cards: Flashcard[];
}

export interface GetStudyHistoryResponse {
  sessions: FlashcardStudySession[];
}

export interface GetProgressResponse extends FlashcardSetProgress {
  progressPercentage: number;
}

// API Functions

/**
 * Get or create a study session
 */
export async function getOrCreateStudySessionApi(
  dto: CreateStudySessionDto
): Promise<GetOrCreateSessionResponse> {
  const response = await api.post("/flashcard-study/session", dto);
  return response.data;
}

/**
 * Update a study session
 */
export async function updateStudySessionApi(
  sessionId: string,
  dto: UpdateStudySessionDto
): Promise<UpdateSessionResponse> {
  const response = await api.put(`/flashcard-study/session/${sessionId}`, dto);
  return response.data;
}

/**
 * Complete a study session
 */
export async function completeStudySessionApi(
  sessionId: string,
  dto: CompleteSessionDto
): Promise<CompleteSessionResponse> {
  const response = await api.post(
    `/flashcard-study/session/${sessionId}/complete`,
    dto
  );
  return response.data;
}

/**
 * Review a card (for spaced repetition)
 */
export async function reviewCardApi(
  sessionId: string,
  dto: ReviewCardDto
): Promise<ReviewCardResponse> {
  const response = await api.post(
    `/flashcard-study/session/${sessionId}/review`,
    dto
  );
  return response.data;
}

/**
 * Get cards for study based on mode
 */
export async function getCardsForStudyApi(
  flashCardSetId: string,
  mode: StudyMode = STUDY_MODE.LEARN
): Promise<GetCardsForStudyResponse> {
  const response = await api.get(`/flashcard-study/cards/${flashCardSetId}`, {
    params: { mode },
  });
  return response.data;
}

/**
 * Get study history for a flashcard set
 */
export async function getStudyHistoryApi(
  flashCardSetId: string
): Promise<GetStudyHistoryResponse> {
  const response = await api.get(`/flashcard-study/history/${flashCardSetId}`);
  return response.data;
}

/**
 * Get progress for a flashcard set
 */
export async function getProgressApi(
  flashCardSetId: string
): Promise<GetProgressResponse> {
  const response = await api.get(`/flashcard-study/progress/${flashCardSetId}`);
  return response.data;
}
