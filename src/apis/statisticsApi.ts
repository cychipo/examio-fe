import { api } from "./api";

export interface TeacherCreationStat {
  day: string;
  quizSets: number;
  flashcardSets: number;
}

export interface TeacherActivityStat {
  day: string;
  examAttempts: number;
  flashcardViews: number;
}

export interface TopRoomParticipant {
  id: string;
  title: string;
  participants: number;
}

export interface TopRoomAvgScore {
  id: string;
  title: string;
  avgScore: number;
  count: number;
}

export interface TopFlashcardSet {
  id: string;
  title: string;
  viewCount: number;
}

export interface TeacherSummary {
  totalQuizSets: number;
  totalFlashcardSets: number;
  totalExamRooms: number;
}

export interface TeacherDashboardStats {
  creationStats: TeacherCreationStat[];
  activityStats: TeacherActivityStat[];
  topRoomsByParticipants: TopRoomParticipant[];
  topRoomsByAvgScore: TopRoomAvgScore[];
  topFlashcardSets: TopFlashcardSet[];
  summary: TeacherSummary;
  updatedAt: string;
}

export const getTeacherStats = async (range: string = '7d'): Promise<TeacherDashboardStats> => {
  const response = await api.get("/statistics/teacher", {
    params: { range }
  });
  return response.data;
};

// Student Dashboard Stats
export interface StudentExamStat {
  day: string;
  examAttempts: number;
}

export interface StudentFlashcardStat {
  day: string;
  viewCount: number;
}

export interface StudentRecentScore {
  day: string;
  score: number;
}

export interface StudentSummary {
  totalExamAttempts: number;
  totalFlashcardViews: number;
  averageScore: number;
}

export interface StudentDashboardStats {
  examStats: StudentExamStat[];
  flashcardStats: StudentFlashcardStat[];
  recentScores: StudentRecentScore[];
  summary: StudentSummary;
  updatedAt: string;
}

export const getStudentStats = async (range: string = '7d'): Promise<StudentDashboardStats> => {
  const response = await api.get("/statistics/student", {
    params: { range }
  });
  return response.data;
};
