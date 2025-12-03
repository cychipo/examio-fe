export interface Quizz {
  id: string;
  question: string;
  options: string[];
  answer: string;
  createdAt: string;
  updatedAt: string;
}

export interface LastAttemptInfo {
  id: string;
  isSubmitted: boolean;
  score: number | null;
  timeSpentSeconds: number;
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
  questionCount: number;
  lastStudied?: string | null;
  lastAttempt?: LastAttemptInfo | null;
}
