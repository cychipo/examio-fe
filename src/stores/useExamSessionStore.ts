import { create } from "zustand";
import {
  getExamSessionsApi,
  createExamSessionApi,
  updateExamSessionApi,
  deleteExamSessionApi,
  getExamSessionByIdApi,
  type CredentialsCreateExamSession,
  type CredentialsUpdateExamSession,
  type CredentialsGetExamSessions,
} from "@/apis/examSessionApi";
import { ExamSession } from "@/types/examSession";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { toast } from "@/components/ui/toast";

interface ExamSessionStore {
  examSessions: ExamSession[];
  currentExamSession: ExamSession | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchExamSessions: (
    params: CredentialsGetExamSessions,
    options?: { forceRefresh?: boolean }
  ) => Promise<void>;
  fetchExamSessionById: (id: string) => Promise<void>;
  createExamSession: (
    credentials: CredentialsCreateExamSession
  ) => Promise<void>;
  updateExamSession: (
    id: string,
    credentials: CredentialsUpdateExamSession
  ) => Promise<void>;
  deleteExamSession: (id: string) => Promise<void>;
  invalidateCache: () => void;
}

export const useExamSessionStore = create<ExamSessionStore>((set) => ({
  examSessions: [],
  currentExamSession: null,
  loading: false,
  error: null,

  fetchExamSessions: async (params, options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = storeCache.createKey("examsessions", params);

    try {
      set({ loading: true, error: null });

      const data = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          const response = await getExamSessionsApi(params);
          return response.examSessions;
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );

      set({
        examSessions: data,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy danh sách buổi thi thất bại", {
        description: errorMessage,
      });
      console.error("Lấy danh sách buổi thi thất bại:", error);
      throw error;
    }
  },

  fetchExamSessionById: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const examSession = await getExamSessionByIdApi(id);

      set({
        currentExamSession: examSession,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy thông tin buổi thi thất bại", {
        description: errorMessage,
      });
      console.error("Lấy thông tin buổi thi thất bại:", error);
      throw error;
    }
  },

  createExamSession: async (credentials: CredentialsCreateExamSession) => {
    try {
      set({ loading: true, error: null });

      const response = await createExamSessionApi(credentials);

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("examsessions:");

      // Thêm exam session mới vào danh sách
      set((state) => ({
        examSessions: [response.examSession, ...state.examSessions],
        loading: false,
      }));

      toast.success("Tạo buổi thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Tạo buổi thi thất bại", {
        description: errorMessage,
      });
      console.error("Tạo buổi thi thất bại:", error);
      throw error;
    }
  },

  updateExamSession: async (
    id: string,
    credentials: CredentialsUpdateExamSession
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await updateExamSessionApi(id, credentials);

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("examsessions:");

      // Cập nhật exam session trong danh sách
      set((state) => ({
        examSessions: state.examSessions.map((session) =>
          session.id === id ? response.examSession : session
        ),
        currentExamSession:
          state.currentExamSession?.id === id
            ? response.examSession
            : state.currentExamSession,
        loading: false,
      }));

      toast.success("Cập nhật buổi thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Cập nhật buổi thi thất bại", {
        description: errorMessage,
      });
      console.error("Cập nhật buổi thi thất bại:", error);
      throw error;
    }
  },

  deleteExamSession: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await deleteExamSessionApi(id);

      // Invalidate cache sau khi xóa
      storeCache.invalidate("examsessions:");

      // Xóa exam session khỏi danh sách
      set((state) => ({
        examSessions: state.examSessions.filter((session) => session.id !== id),
        currentExamSession:
          state.currentExamSession?.id === id ? null : state.currentExamSession,
        loading: false,
      }));

      toast.success("Xóa buổi thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Xóa buổi thi thất bại", {
        description: errorMessage,
      });
      console.error("Xóa buổi thi thất bại:", error);
      throw error;
    }
  },

  invalidateCache: () => {
    storeCache.invalidate("examsessions:");
  },
}));
