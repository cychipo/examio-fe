"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FormSelectQuizSet } from "@/components/atoms/k/FormSelectQuizSet";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import {
  useTestGeneratorStore,
  useFlashcardGeneratorStore,
} from "@/stores/useAIGeneratorStore";
import { Loader2 } from "lucide-react";

export enum DialogAddExamType {
  QUIZZ = 1,
  FLASH_CARD = 2,
}

interface DialogAddExamProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  type: DialogAddExamType;
}

export function DialogAddExam(props: DialogAddExamProps) {
  const { setQuizzesToQuizset, loading } = useQuizSetStore();
  const { generatedTest } = useTestGeneratorStore();
  const { generatedCards } = useFlashcardGeneratorStore();
  const [selectedQuizSetIds, setSelectedQuizSetIds] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedQuizSetIds.length === 0) {
      return;
    }

    try {
      if (props.type === DialogAddExamType.QUIZZ && generatedTest) {
        // Convert generated test to quiz format
        const quizzes = generatedTest.map((quiz) => ({
          question: quiz.question,
          options: quiz.options,
          answer: quiz.answer,
        }));

        await setQuizzesToQuizset({
          quizsetIds: selectedQuizSetIds,
          quizzes,
        });
      } else if (
        props.type === DialogAddExamType.FLASH_CARD &&
        generatedCards
      ) {
        const quizzes = generatedCards.map((card) => ({
          question: card.question,
          options: [card.answer],
          answer: "A",
        }));

        await setQuizzesToQuizset({
          quizsetIds: selectedQuizSetIds,
          quizzes,
        });
      }

      // Reset and close
      setSelectedQuizSetIds([]);
      setOpen(false);
    } catch (error) {
      console.error("Error adding to quiz set:", error);
    }
  };

  const hasData =
    (props.type === DialogAddExamType.QUIZZ && generatedTest) ||
    (props.type === DialogAddExamType.FLASH_CARD && generatedCards);

  const isDisabled = loading || selectedQuizSetIds.length === 0 || !hasData;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>
              {props.description || "Chọn bộ câu hỏi để lưu vào hệ thống"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <FormSelectQuizSet
              selectedIds={selectedQuizSetIds}
              onSelectionChange={setSelectedQuizSetIds}
              onCreateSuccess={() => {
                // Khi tạo quiz set mới thành công, không đóng dialog
                // User có thể tiếp tục chọn để lưu
              }}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isDisabled}
              className="cursor-pointer">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
