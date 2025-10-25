export interface Quizz {
  id: string;
  quizSetId: string;
  question: string;
  options: string[];
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizSet {
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
  questions?: Quizz[];
}
