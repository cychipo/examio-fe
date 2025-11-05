export enum ASSESS_TYPE {
  PUBLIC = 0,
  PRIVATE = 1,
}

export interface ExamRoom {
  id: string;
  title: string;
  description?: string;
  quizSetId: string;
  hostId: string;
  assessType: ASSESS_TYPE;
  allowRetake: boolean;
  maxAttempts: number;
  createdAt: string;
  updatedAt: string;
}
