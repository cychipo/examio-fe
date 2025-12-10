import { create } from "zustand";
import {
  getExamRoomSessionsApi,
  ResponseListExamSessions,
} from "@/apis/examRoomApi";
import {
  createExamSessionApi,
  updateExamSessionApi,
  deleteExamSessionApi,
  type CredentialsCreateExamSession,
  type CredentialsUpdateExamSession,
} from "@/apis/examSessionApi";
import { ExamSessionBasic } from "@/types/examRoom";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { toast } from "@/components/ui/toast";

interface ExamRoomDetailStore {
  // Sessions data
  sessions: ExamSessionBasic[];
  sessionsTotal: number;
  sessionsTotalPages: number;
  loadingSessions: boolean;

  // Mutation loading
  mutationLoading: boolean;

  // Actions
  fetchSessions: (
    examRoomId: string,
    page: number,
    limit: number,
    options?: { forceRefresh?: boolean }
  ) => Promise<void>;
  createSession: (
    credentials: CredentialsCreateExamSession
  ) => Promise<boolean>;
  updateSession: (
    id: string,
    credentials: CredentialsUpdateExamSession
  ) => Promise<boolean>;
  deleteSession: (id: string, examRoomId: string) => Promise<boolean>;
  invalidateSessionsCache: (examRoomId: string) => void;
  reset: () => void;
}

export const useExamRoomDetailStore = create<ExamRoomDetailStore>((set) => ({
  // Initial state
  sessions: [],
  sessionsTotal: 0,
  sessionsTotalPages: 0,
  loadingSessions: false,

  mutationLoading: false,

  fetchSessions: async (examRoomId, page, limit, options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = storeCache.createKey("examroom-sessions", {
      examRoomId,
      page,
      limit,
    });

    try {
      set({ loadingSessions: true });

      const data = await storeCache.fetchWithCache<ResponseListExamSessions>(
        cacheKey,
        async () => {
          return await getExamRoomSessionsApi(examRoomId, page, limit);
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );

      set({
        sessions: data.sessions,
        sessionsTotal: data.total,
        sessionsTotalPages: data.totalPages,
        loadingSessions: false,
      });
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Không thể tải danh sách phiên thi");
      set({ loadingSessions: false });
    }
  },

  createSession: async (credentials) => {
    try {
      set({ mutationLoading: true });

      const response = await createExamSessionApi(credentials);
      const newSession = response.examSession;

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("examroom-sessions:");
      storeCache.invalidate("examsessions:");

      // Add new session to local state (at the beginning)
      set((state) => ({
        sessions: [
          {
            id: newSession.id,
            examRoomId: newSession.examRoomId,
            startTime: newSession.startTime,
            endTime: newSession.endTime,
            status: newSession.status,
            autoJoinByLink: newSession.autoJoinByLink,
            assessType: newSession.assessType,
            allowRetake: newSession.allowRetake,
            maxAttempts: newSession.maxAttempts,
            showAnswersAfterSubmit: newSession.showAnswersAfterSubmit,
            _count: { participants: 0, examAttempts: 0 },
          } as ExamSessionBasic,
          ...state.sessions,
        ],
        sessionsTotal: state.sessionsTotal + 1,
        mutationLoading: false,
      }));

      toast.success("Tạo phiên thi thành công");
      return true;
    } catch (error) {
      console.error("Error creating session:", error);
      toast.error("Tạo phiên thi thất bại");
      set({ mutationLoading: false });
      return false;
    }
  },

  updateSession: async (id, credentials) => {
    try {
      set({ mutationLoading: true });

      const response = await updateExamSessionApi(id, credentials);
      const updatedSession = response.examSession;

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("examroom-sessions:");
      storeCache.invalidate("examsessions:");

      // Cập nhật session trong local state với dữ liệu trả về từ API
      set((state) => ({
        sessions: state.sessions.map((session) =>
          session.id === id
            ? {
                ...session,
                startTime: updatedSession.startTime,
                endTime: updatedSession.endTime,
                status: updatedSession.status,
                assessType: updatedSession.assessType,
                allowRetake: updatedSession.allowRetake,
                maxAttempts: updatedSession.maxAttempts,
                showAnswersAfterSubmit:
                  updatedSession.showAnswersAfterSubmit ??
                  session.showAnswersAfterSubmit,
              }
            : session
        ),
        mutationLoading: false,
      }));

      toast.success("Cập nhật phiên thi thành công");
      return true;
    } catch (error) {
      console.error("Error updating session:", error);
      toast.error("Cập nhật phiên thi thất bại");
      set({ mutationLoading: false });
      return false;
    }
  },

  deleteSession: async (id, examRoomId) => {
    try {
      set({ mutationLoading: true });

      await deleteExamSessionApi(id);

      // Invalidate cache sau khi xóa
      storeCache.invalidate("examroom-sessions:");
      storeCache.invalidate("examsessions:");

      // Xóa session khỏi local state
      set((state) => ({
        sessions: state.sessions.filter((session) => session.id !== id),
        sessionsTotal: state.sessionsTotal - 1,
        mutationLoading: false,
      }));

      toast.success("Xóa phiên thi thành công");
      return true;
    } catch (error) {
      console.error("Error deleting session:", error);
      toast.error("Xóa phiên thi thất bại");
      set({ mutationLoading: false });
      return false;
    }
  },

  invalidateSessionsCache: (examRoomId) => {
    storeCache.invalidate(`examroom-sessions:${examRoomId}`);
    storeCache.invalidate("examroom-sessions:");
  },

  reset: () => {
    set({
      sessions: [],
      sessionsTotal: 0,
      sessionsTotalPages: 0,
      loadingSessions: false,
      mutationLoading: false,
    });
  },
}));
