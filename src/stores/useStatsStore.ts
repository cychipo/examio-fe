import { create } from "zustand";
import { env } from "@/lib/env";

interface StatsData {
  totalGroups: number;
  totalGroupsTrend: number;
  totalCards: number;
  totalCardsTrend: number;
  totalViews: number;
  totalViewsTrend: number;
}

interface QuizStatsData {
  totalGroups: number;
  totalGroupsTrend: number;
  totalQuestions: number;
  totalQuestionsTrend: number;
  avgScore: number;
  avgScoreTrend: number;
  testedToday: number;
  testedTodayTrend: number;
  completionRate: number;
  activeExams: number;
}

interface StatsStore {
  flashcardStats: StatsData | null;
  quizStats: QuizStatsData | null;
  loadingFlashcardStats: boolean;
  loadingQuizStats: boolean;
  fetchFlashcardStats: () => Promise<void>;
  fetchQuizStats: () => Promise<void>;
  invalidateFlashcardStats: () => void;
  invalidateQuizStats: () => void;
}

export const useStatsStore = create<StatsStore>((set, get) => ({
  flashcardStats: null,
  quizStats: null,
  loadingFlashcardStats: false,
  loadingQuizStats: false,

  fetchFlashcardStats: async () => {
    // If we already have stats, don't fetch again
    if (get().flashcardStats || get().loadingFlashcardStats) return;

    set({ loadingFlashcardStats: true });
    try {
      const response = await fetch(
        `${env.apiUrl}/flashcardsets/stats`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      set({
        flashcardStats: {
          totalGroups: data.totalGroups || 0,
          totalGroupsTrend: 0,
          totalCards: data.totalCards || 0,
          totalCardsTrend: 0,
          totalViews: data.totalViews || 0,
          totalViewsTrend: 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch flashcard stats:", error);
    } finally {
      set({ loadingFlashcardStats: false });
    }
  },

  fetchQuizStats: async () => {
    // If we already have stats, don't fetch again
    if (get().quizStats || get().loadingQuizStats) return;

    set({ loadingQuizStats: true });
    try {
      const response = await fetch(
        `${env.apiUrl}/quizsets/stats`,
        {
          credentials: "include",
        }
      );
      const data = await response.json();
      set({
        quizStats: {
          totalGroups: data.totalExams || 0,
          totalGroupsTrend: 0,
          totalQuestions: data.totalQuestions || 0,
          totalQuestionsTrend: 0,
          avgScore: data.avgScore || 0,
          avgScoreTrend: 0,
          testedToday: data.testedToday || 0,
          testedTodayTrend: 0,
          completionRate: data.completionRate || 0,
          activeExams: data.activeExams || 0,
        },
      });
    } catch (error) {
      console.error("Failed to fetch quiz stats:", error);
    } finally {
      set({ loadingQuizStats: false });
    }
  },

  invalidateFlashcardStats: () => set({ flashcardStats: null }),
  invalidateQuizStats: () => set({ quizStats: null }),
}));
