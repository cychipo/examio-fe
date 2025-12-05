import { create } from "zustand";
import {
  getExamRoomsApi,
  createExamRoomApi,
  updateExamRoomApi,
  deleteExamRoomApi,
  getExamRoomByIdApi,
  getAllExamRoomsApi,
  type CredentialsCreateExamRoom,
  type CredentialsUpdateExamRoom,
  type CredentialsGetExamRooms,
} from "@/apis/examRoomApi";
import { ExamRoom } from "@/types/examRoom";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { toast } from "@/components/ui/toast";

interface ExamRoomStore {
  examRooms: ExamRoom[];
  currentExamRoom: ExamRoom | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchExamRooms: (
    params: CredentialsGetExamRooms,
    options?: { forceRefresh?: boolean }
  ) => Promise<any>;
  fetchAllExamRooms: (options?: { forceRefresh?: boolean }) => Promise<any>;
  fetchExamRoomById: (id: string) => Promise<void>;
  createExamRoom: (credentials: CredentialsCreateExamRoom) => Promise<void>;
  updateExamRoom: (
    id: string,
    credentials: CredentialsUpdateExamRoom
  ) => Promise<void>;
  deleteExamRoom: (id: string) => Promise<void>;
  invalidateCache: () => void;
}

export const useExamRoomStore = create<ExamRoomStore>((set) => ({
  examRooms: [],
  currentExamRoom: null,
  loading: false,
  error: null,

  fetchExamRooms: async (params, options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = storeCache.createKey("examrooms", params);

    try {
      set({ loading: true, error: null });

      const response = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          return await getExamRoomsApi(params);
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );

      set({
        examRooms: response.examRooms,
        loading: false,
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy danh sách phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Lấy danh sách phòng thi thất bại:", error);
      throw error;
    }
  },

  fetchAllExamRooms: async (options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = storeCache.createKey("examrooms-all", {});

    try {
      set({ loading: true, error: null });

      const response = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          return await getAllExamRoomsApi();
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );

      set({
        examRooms: response.examRooms,
        loading: false,
      });

      return response;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy danh sách phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Lấy danh sách phòng thi thất bại:", error);
      throw error;
    }
  },

  fetchExamRoomById: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const examRoom = await getExamRoomByIdApi(id);

      set({
        currentExamRoom: examRoom,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy thông tin phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Lấy thông tin phòng thi thất bại:", error);
      throw error;
    }
  },

  createExamRoom: async (credentials: CredentialsCreateExamRoom) => {
    try {
      set({ loading: true, error: null });

      const response = await createExamRoomApi(credentials);

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("examrooms:");

      // Thêm exam room mới vào danh sách
      set((state) => ({
        examRooms: [response.examRoom, ...state.examRooms],
        loading: false,
      }));

      toast.success("Tạo phòng thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Tạo phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Tạo phòng thi thất bại:", error);
      throw error;
    }
  },

  updateExamRoom: async (
    id: string,
    credentials: CredentialsUpdateExamRoom
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await updateExamRoomApi(id, credentials);

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("examrooms:");

      // Cập nhật exam room trong danh sách
      set((state) => ({
        examRooms: state.examRooms.map((room) =>
          room.id === id ? response.examRoom : room
        ),
        currentExamRoom:
          state.currentExamRoom?.id === id
            ? response.examRoom
            : state.currentExamRoom,
        loading: false,
      }));

      toast.success("Cập nhật phòng thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Cập nhật phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Cập nhật phòng thi thất bại:", error);
      throw error;
    }
  },

  deleteExamRoom: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await deleteExamRoomApi(id);

      // Invalidate cache sau khi xóa
      storeCache.invalidate("examrooms:");

      // Xóa exam room khỏi danh sách
      set((state) => ({
        examRooms: state.examRooms.filter((room) => room.id !== id),
        currentExamRoom:
          state.currentExamRoom?.id === id ? null : state.currentExamRoom,
        loading: false,
      }));

      toast.success("Xóa phòng thi thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Xóa phòng thi thất bại", {
        description: errorMessage,
      });
      console.error("Xóa phòng thi thất bại:", error);
      throw error;
    }
  },

  invalidateCache: () => {
    storeCache.invalidate("examrooms:");
  },
}));
