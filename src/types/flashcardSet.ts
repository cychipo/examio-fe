export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
  label?: {
    id: string;
    name: string;
    color: string | null;
  };
}

export interface FlashcardStudySession {
  id: string;
  flashCardSetId: string;
  userId: string;
  studyMode: number;
  cardsStudied: number;
  correctCount: number;
  incorrectCount: number;
  timeSpentSeconds: number;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardSetProgress {
  totalCards: number;
  studiedCards: number;
  masteredCards: number;
  reviewDueCards: number;
  averageQuality: number;
  lastStudiedAt: string | null;
}

export interface FlashcardSetCreator {
  id: string;
  username: string;
  name: string | null;
  avatar: string | null;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  userId: string;
  thumbnail: string | null;
  isPublic: boolean;
  isPinned: boolean;
  viewCount: number;
  accessCode?: string | null;
  whitelist?: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  flashCards?: Flashcard[];
  cardCount?: number;
  creator?: FlashcardSetCreator;
  _count?: {
    detailsFlashCard: number;
  };
}

export interface FlashcardSetPublicInfo {
  id: string;
  title: string;
  description?: string;
  thumbnail?: string;
  viewCount: number;
  cardCount: number;
  creator: FlashcardSetCreator;
  createdAt: string;
  isPublic: boolean;
  requiresCode: boolean;
}

export interface AccessCheckResult {
  hasAccess: boolean;
  accessType: "public" | "owner" | "whitelist" | "code_required" | "denied";
  requiresCode?: boolean;
}

export interface SharingSettings {
  id: string;
  isPublic: boolean;
  accessCode: string | null;
  whitelist: string[];
}
