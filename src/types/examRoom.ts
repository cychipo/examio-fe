export interface ExamRoom {
  id: string;
  title: string;
  description?: string;
  quizSetId: string;
  hostId: string;
  createdAt: string;
  updatedAt: string;
  // Relations (optional, có thể có khi fetch detail)
  quizSet?: {
    id: string;
    title: string;
    questionCount?: number;
    thumbnail?: string;
    _count?: {
      detailsQuizQuestions?: number;
    };
  };
  host?: {
    id: string;
    username: string;
    name?: string;
    email?: string;
  };
  _count?: {
    examSessions?: number;
  };
  examSessions?: ExamSessionBasic[];
}

export interface ExamSessionBasic {
  id: string;
  examRoomId: string;
  status: number;
  startTime: string;
  endTime?: string;
  autoJoinByLink: boolean;
  assessType: number;
  allowRetake: boolean;
  maxAttempts: number;
  showAnswersAfterSubmit: boolean;
  passingScore?: number;
  // Question configuration
  questionCount?: number | null;
  questionSelectionMode?: number;
  labelQuestionConfig?: any[] | null;
  shuffleQuestions?: boolean;
  distinctUserCount?: number;
  _count?: {
    participants?: number;
    examAttempts?: number;
  };
}
