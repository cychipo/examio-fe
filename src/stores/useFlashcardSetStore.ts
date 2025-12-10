import { create } from "zustand";
import {
  getFlashcardSetsApi,
  createFlashcardSetApi,
  setHistoryFlashcardsToFlashcardSet,
  deleteFlashcardSetApi,
  getFlashcardSetByIdApi,
  updateFlashcardSetApi,
  addFlashcardToFlashcardSet,
  updateFlashcardInFlashcardSet,
  deleteFlashcardFromFlashcardSet,
  type CredentialsFlashcardSet,
  type CredentialsGetFlashcardSets,
  type CredentialSetHistoryToFlashcardSet,
  type CreateFlashcardData,
  type UpdateFlashcardData,
} from "@/apis/flashcardSetApi";
import { FlashcardSet } from "@/types/flashcardSet";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { toast } from "@/components/ui/toast";

interface FlashcardSetStore {
  flashcardSetsK: Omit<FlashcardSet, "flashcards">[];
  currentFlashcardSet: FlashcardSet | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchFlashcardSets: (
    params: CredentialsGetFlashcardSets,
    options?: { forceRefresh?: boolean }
  ) => Promise<any>;
  fetchFlashcardSetById: (id: string) => Promise<void>;
  createFlashcardSet: (
    credentials: CredentialsFlashcardSet,
    thumbnailFile?: File
  ) => Promise<void>;
  updateFlashcardSet: (
    id: string,
    credentials: CredentialsFlashcardSet,
    thumbnailFile?: File
  ) => Promise<void>;
  deleteFlashcardSet: (id: string) => Promise<void>;
  setHistoryFlashcardsToFlashcardSet: (
    credentials: CredentialSetHistoryToFlashcardSet
  ) => Promise<void>;
  invalidateCache: () => void;
  // Flashcard CRUD methods
  addFlashcard: (
    flashcardSetId: string,
    flashcardData: CreateFlashcardData
  ) => Promise<void>;
  updateFlashcard: (
    flashcardSetId: string,
    flashcardId: string,
    flashcardData: UpdateFlashcardData
  ) => Promise<void>;
  deleteFlashcard: (
    flashcardSetId: string,
    flashcardId: string
  ) => Promise<void>;
}

export const useFlashcardSetStore = create<FlashcardSetStore>((set) => ({
  flashcardSetsK: [],
  currentFlashcardSet: null,
  loading: false,
  error: null,

  fetchFlashcardSets: async (params, options = {}) => {
    const { forceRefresh = false } = options;
    const cacheKey = storeCache.createKey("flashcardsets", params);

    try {
      set({ loading: true, error: null });

      const response = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          return await getFlashcardSetsApi(params);
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
          forceRefresh,
        }
      );

      set({
        flashcardSetsK: response.flashcardSets,
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
      toast.error("Lấy bộ flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Lấy bộ flashcard thất bại:", error);
      throw error;
    }
  },

  fetchFlashcardSetById: async (id: string) => {
    try {
      set({ loading: true, error: null });

      const flashcardSet = await getFlashcardSetByIdApi(id);

      const normalizedFlashcardSet: FlashcardSet = {
        ...flashcardSet,
        flashCards: flashcardSet.flashCards || [],
      };

      set({
        currentFlashcardSet: normalizedFlashcardSet,
        loading: false,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Lấy thông tin bộ flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Lấy thông tin bộ flashcard thất bại:", error);
      throw error;
    }
  },

  createFlashcardSet: async (
    credentials: CredentialsFlashcardSet,
    thumbnailFile?: File
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await createFlashcardSetApi(credentials, thumbnailFile);

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("flashcardsets");

      // Thêm flashcard set mới vào danh sách
      set((state) => ({
        flashcardSetsK: [response.flashcardSet, ...state.flashcardSetsK],
        loading: false,
      }));

      toast.success("Tạo bộ flashcard thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Tạo bộ flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Tạo bộ flashcard thất bại:", error);
      throw error;
    }
  },

  updateFlashcardSet: async (
    id: string,
    credentials: CredentialsFlashcardSet,
    thumbnailFile?: File
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await updateFlashcardSetApi(
        id,
        credentials,
        thumbnailFile
      );

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("flashcardsets");

      // Cập nhật trong danh sách
      set((state) => ({
        flashcardSetsK: state.flashcardSetsK.map((set) =>
          set.id === id ? response.flashcardSet : set
        ),
        currentFlashcardSet:
          state.currentFlashcardSet?.id === id
            ? { ...state.currentFlashcardSet, ...response.flashcardSet }
            : state.currentFlashcardSet,
        loading: false,
      }));

      toast.success("Cập nhật bộ flashcard thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Cập nhật bộ flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Cập nhật bộ flashcard thất bại:", error);
      throw error;
    }
  },

  deleteFlashcardSet: async (id: string) => {
    try {
      set({ loading: true, error: null });

      await deleteFlashcardSetApi(id);

      // Invalidate cache sau khi xóa
      storeCache.invalidate("flashcardsets");

      // Xóa khỏi danh sách
      set((state) => ({
        flashcardSetsK: state.flashcardSetsK.filter((set) => set.id !== id),
        currentFlashcardSet:
          state.currentFlashcardSet?.id === id
            ? null
            : state.currentFlashcardSet,
        loading: false,
      }));

      toast.success("Xóa bộ flashcard thành công");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Xóa bộ flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Xóa bộ flashcard thất bại:", error);
      throw error;
    }
  },

  setHistoryFlashcardsToFlashcardSet: async (
    credentials: CredentialSetHistoryToFlashcardSet
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await setHistoryFlashcardsToFlashcardSet(credentials);

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("flashcardsets");

      set({ loading: false });

      response.createdCount > 0
        ? toast.success(`Thêm danh sách flashcard vào bộ đề thành công`)
        : toast.info("Danh sách flashcard này đã được thêm trước đó");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Thêm flashcard từ lịch sử thất bại", {
        description: errorMessage,
      });
      console.error("Thêm flashcard từ lịch sử thất bại:", error);
      throw error;
    }
  },

  invalidateCache: () => {
    storeCache.clear();
  },

  // ========== FLASHCARD CRUD METHODS ==========

  addFlashcard: async (
    flashcardSetId: string,
    flashcardData: CreateFlashcardData
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await addFlashcardToFlashcardSet(
        flashcardSetId,
        flashcardData
      );

      // Optimistic update - add new flashcard to state
      set((state) => {
        if (!state.currentFlashcardSet) return { loading: false };

        return {
          currentFlashcardSet: {
            ...state.currentFlashcardSet,
            flashCards: [
              ...(state.currentFlashcardSet.flashCards || []),
              response.flashcard,
            ],
          },
          loading: false,
        };
      });

      toast.success("Thêm flashcard thành công");

      // Invalidate all cache
      storeCache.clear();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Thêm flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Thêm flashcard thất bại:", error);
      throw error;
    }
  },

  updateFlashcard: async (
    flashcardSetId: string,
    flashcardId: string,
    flashcardData: UpdateFlashcardData
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await updateFlashcardInFlashcardSet(
        flashcardSetId,
        flashcardId,
        flashcardData
      );

      // Update state with response from server
      set((state) => {
        if (
          !state.currentFlashcardSet ||
          !state.currentFlashcardSet.flashCards
        ) {
          return { loading: false };
        }

        return {
          currentFlashcardSet: {
            ...state.currentFlashcardSet,
            flashCards: state.currentFlashcardSet.flashCards.map((f) =>
              f.id === flashcardId ? response.flashcard : f
            ),
          },
          loading: false,
        };
      });

      toast.success("Cập nhật flashcard thành công");

      // Invalidate all cache
      storeCache.clear();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Cập nhật flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Cập nhật flashcard thất bại:", error);
      throw error;
    }
  },

  deleteFlashcard: async (flashcardSetId: string, flashcardId: string) => {
    try {
      set({ loading: true, error: null });

      await deleteFlashcardFromFlashcardSet(flashcardSetId, flashcardId);

      // Optimistic update - remove flashcard from state
      set((state) => {
        if (
          !state.currentFlashcardSet ||
          !state.currentFlashcardSet.flashCards
        ) {
          return { loading: false };
        }

        return {
          currentFlashcardSet: {
            ...state.currentFlashcardSet,
            flashCards: state.currentFlashcardSet.flashCards.filter(
              (f) => f.id !== flashcardId
            ),
          },
          loading: false,
        };
      });

      toast.success("Xóa flashcard thành công");

      // Invalidate all cache
      storeCache.clear();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      set({
        error: errorMessage,
        loading: false,
      });
      toast.error("Xóa flashcard thất bại", {
        description: errorMessage,
      });
      console.error("Xóa flashcard thất bại:", error);
      throw error;
    }
  },
}));
