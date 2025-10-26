import { create } from "zustand";
import {
  getFlashcardSetsApi,
  createFlashcardSetApi,
  setHistoryFlashcardsToFlashcardSet,
  type CredentialsFlashcardSet,
  type CredentialsGetFlashcardSets,
  type CredentialSetHistoryToFlashcardSet,
} from "@/apis/flashcardSetApi";
import { FlashcardSet } from "@/types/flashcardSet";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { toast } from "@/components/ui/toast";

interface FlashcardSetStore {
  flashcardSetsK: Omit<FlashcardSet, "flashcards">[];
  loading: boolean;
  error: string | null;

  // Actions
  fetchFlashcardSets: (params: CredentialsGetFlashcardSets) => Promise<void>;
  createFlashcardSet: (credentials: CredentialsFlashcardSet) => Promise<void>;
  setHistoryFlashcardsToFlashcardSet: (
    credentials: CredentialSetHistoryToFlashcardSet
  ) => Promise<void>;
}

export const useFlashcardSetStore = create<FlashcardSetStore>((set) => ({
  flashcardSetsK: [],
  loading: false,
  error: null,

  fetchFlashcardSets: async (params: CredentialsGetFlashcardSets) => {
    const cacheKey = storeCache.createKey("flashcardsets", params);

    try {
      set({ loading: true, error: null });

      const data = await storeCache.fetchWithCache(
        cacheKey,
        async () => {
          const response = await getFlashcardSetsApi(params);
          return response.flashcardSets;
        },
        {
          ttl: CacheTTL.FIVE_MINUTES,
        }
      );

      set({
        flashcardSetsK: data,
        loading: false,
      });
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

  createFlashcardSet: async (credentials: CredentialsFlashcardSet) => {
    try {
      set({ loading: true, error: null });

      const response = await createFlashcardSetApi(credentials);

      // Invalidate cache sau khi tạo mới
      storeCache.invalidate("flashcardsets:");

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

  setHistoryFlashcardsToFlashcardSet: async (
    credentials: CredentialSetHistoryToFlashcardSet
  ) => {
    try {
      set({ loading: true, error: null });

      const response = await setHistoryFlashcardsToFlashcardSet(credentials);

      // Invalidate cache sau khi cập nhật
      storeCache.invalidate("flashcardsets:");

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
}));
