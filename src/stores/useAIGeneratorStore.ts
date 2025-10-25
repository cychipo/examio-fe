import { create } from "zustand";
import { Quizz, Flashcard, TypeResultGenerateExam } from "@/types/exam";
import { generateExamApi } from "@/apis/examApi";
import { toast } from "@/components/ui/toast";

interface TestGeneratorState {
  file: File | null;
  questionCount: number;
  isNarrow: boolean;
  keyword: string;
  generatedTest: Quizz[] | null;
  isGenerating: boolean;
  setFile: (file: File | null) => void;
  setQuestionCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  generateTest: () => Promise<void>;
  clearTest: () => void;
}

interface FlashcardGeneratorState {
  file: File | null;
  cardCount: number;
  isNarrow: boolean;
  keyword: string;
  generatedCards: Flashcard[] | null;
  currentCard: number;
  isGenerating: boolean;
  setFile: (file: File | null) => void;
  setCardCount: (count: number) => void;
  setIsNarrow: (isNarrow: boolean) => void;
  setKeyword: (keyword: string) => void;
  setCurrentCard: (index: number) => void;
  generateFlashcards: () => Promise<void>;
  clearFlashcards: () => void;
}

// Test Generator Store
export const useTestGeneratorStore = create<TestGeneratorState>((set, get) => ({
  file: null,
  questionCount: 10,
  isNarrow: false,
  keyword: "",
  generatedTest: null,
  isGenerating: false,

  setFile: (file) => set({ file }),
  setQuestionCount: (questionCount) => set({ questionCount }),
  setIsNarrow: (isNarrow) => set({ isNarrow }),
  setKeyword: (keyword) => set({ keyword }),

  generateTest: async () => {
    const { file, questionCount, isNarrow, keyword } = get();

    if (!file) {
      toast.error("Chưa có file", {
        description: "Vui lòng tải lên file PDF trước",
      });
      return;
    }

    if (isNarrow && !keyword.trim()) {
      toast.error("Chưa nhập từ khóa", {
        description: "Vui lòng nhập từ khóa khi sử dụng định dạng hẹp",
      });
      return;
    }

    set({ isGenerating: true });

    try {
      const result = await generateExamApi({
        file,
        quantityQuizz: questionCount,
        typeResult: TypeResultGenerateExam.QUIZZ,
        isNarrowSearch: isNarrow,
        keyword: isNarrow ? keyword : undefined,
      });

      set({ generatedTest: result as Quizz[], isGenerating: false });
      toast.success("Tạo đề thành công!", {
        description: `Đã tạo ${questionCount} câu hỏi từ tài liệu của bạn`,
      });
    } catch (error) {
      set({ isGenerating: false });
      toast.error("Lỗi tạo đề", {
        description:
          error instanceof Error
            ? error.message
            : "Có lỗi xảy ra khi tạo đề kiểm tra",
      });
      console.error("Error generating test:", error);
    }
  },

  clearTest: () =>
    set({
      file: null,
      generatedTest: null,
      questionCount: 10,
      isNarrow: false,
      keyword: "",
    }),
}));

// Flashcard Generator Store
export const useFlashcardGeneratorStore = create<FlashcardGeneratorState>(
  (set, get) => ({
    file: null,
    cardCount: 15,
    isNarrow: false,
    keyword: "",
    generatedCards: null,
    currentCard: 0,
    isGenerating: false,

    setFile: (file) => set({ file }),
    setCardCount: (cardCount) => set({ cardCount }),
    setIsNarrow: (isNarrow) => set({ isNarrow }),
    setKeyword: (keyword) => set({ keyword }),
    setCurrentCard: (currentCard) => set({ currentCard }),

    generateFlashcards: async () => {
      const { file, cardCount, isNarrow, keyword } = get();

      if (!file) {
        toast.error("Chưa có file", {
          description: "Vui lòng tải lên file PDF trước",
        });
        return;
      }

      if (isNarrow && !keyword.trim()) {
        toast.error("Chưa nhập từ khóa", {
          description: "Vui lòng nhập từ khóa khi sử dụng định dạng thẻ hẹp",
        });
        return;
      }

      set({ isGenerating: true });

      try {
        const result = await generateExamApi({
          file,
          quantityFlashcard: cardCount,
          typeResult: TypeResultGenerateExam.FLASHCARD,
          isNarrowSearch: isNarrow,
          keyword: isNarrow ? keyword : undefined,
        });

        set({
          generatedCards: result as Flashcard[],
          currentCard: 0,
          isGenerating: false,
        });
        toast.success("Tạo flashcard thành công!", {
          description: `Đã tạo ${cardCount} thẻ flashcard từ tài liệu của bạn`,
        });
      } catch (error) {
        set({ isGenerating: false });
        toast.error("Lỗi tạo flashcard", {
          description:
            error instanceof Error
              ? error.message
              : "Có lỗi xảy ra khi tạo flashcard",
        });
        console.error("Error generating flashcards:", error);
      }
    },

    clearFlashcards: () =>
      set({
        file: null,
        generatedCards: null,
        currentCard: 0,
        cardCount: 15,
        isNarrow: false,
        keyword: "",
      }),
  })
);
