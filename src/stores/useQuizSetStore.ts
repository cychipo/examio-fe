import { create } from "zustand";
import { QuizSet } from "@/types/quizset";
import {
  getQuizSetsApi,
  CredentialsGetQuizsets,
  ResponseListQuizsets,
  CredentialsQuizSet,
  CredentialsSetQuizToQuizset,
  setQuizzesToQuizset,
  createQuizSetApi,
  ResponseSetQuizzesToQuizset,
  ResponseCreateQuizset,
} from "@/apis/quizsetApi";
import { toast } from "@/components/ui/toast";
import { storeCache, CacheTTL } from "@/lib/storeCache";

interface QuizSetState {
  quizSetsK: Omit<QuizSet, "questions">[];
  loading: boolean;
  fetchQuizSets: (
    credentials: CredentialsGetQuizsets,
    options?: { forceRefresh?: boolean }
  ) => Promise<void>;
  createQuizSet: (credentials: CredentialsQuizSet) => Promise<void>;
  setQuizzesToQuizset: (
    credentials: CredentialsSetQuizToQuizset
  ) => Promise<void>;
  invalidateCache: () => void;
}

export const useQuizSetStore = create<QuizSetState>((set) => ({
  quizSetsK: [],
  loading: false,

  fetchQuizSets: async (credentials, options = {}) => {
    const { forceRefresh = false } = options;

    // Tạo cache key dựa trên params
    const cacheKey = storeCache.createKey("quizsets", credentials);

    set({ loading: true });
    try {
      const response: ResponseListQuizsets = await storeCache.fetchWithCache(
        cacheKey,
        () => getQuizSetsApi(credentials),
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );
      set({ quizSetsK: response.quizSets });
    } catch (error) {
      toast.error("Lấy bộ câu hỏi thất bại", {
        description: (error as Error).message,
      });
      console.error("Lấy bộ câu hỏi thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },

  createQuizSet: async (credentials) => {
    set({ loading: true });
    try {
      const response: ResponseCreateQuizset = await createQuizSetApi(
        credentials
      );
      set((state) => ({
        quizSetsK: [response.quizSet, ...state.quizSetsK],
      }));
      toast.success("Tạo bộ câu hỏi thành công");

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("quizsets");
    } catch (error) {
      toast.error("Tạo bộ câu hỏi thất bại", {
        description: (error as Error).message,
      });
      console.error("Tạo bộ câu hỏi thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },

  setQuizzesToQuizset: async (credentials) => {
    set({ loading: true });
    try {
      const response: ResponseSetQuizzesToQuizset = await setQuizzesToQuizset(
        credentials
      );
      toast.success(`Thêm ${response.createdCount} câu hỏi thành công`);

      // Invalidate cache sau khi thêm câu hỏi
      storeCache.invalidate("quizsets");
    } catch (error) {
      toast.error("Thêm câu hỏi thất bại", {
        description: (error as Error).message,
      });
      console.error("Thêm câu hỏi thất bại:", error);
    } finally {
      set({ loading: false });
    }
  },

  invalidateCache: () => {
    storeCache.clear();
  },
}));
