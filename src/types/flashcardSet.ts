export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  userId: string;
  thumbnail: string | null;
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  flashcards?: Flashcard[]; // Normalized to lowercase for consistency
  _count?: {
    detailsFlashCard: number;
  };
}
