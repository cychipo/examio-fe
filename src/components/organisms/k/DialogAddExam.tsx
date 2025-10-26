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
import { FormSelectFlashcardSet } from "@/components/atoms/k/FormSelectFlashcardSet";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
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
  const { loading: quizLoading, setHistoryQuizzesToQuizset } =
    useQuizSetStore();
  const { loading: flashcardLoading, setHistoryFlashcardsToFlashcardSet } =
    useFlashcardSetStore();
  const { generatedTest, generatedTestId } = useTestGeneratorStore();
  const { generatedCards, generatedCardsId } = useFlashcardGeneratorStore();
  const [selectedQuizSetIds, setSelectedQuizSetIds] = useState<string[]>([]);
  const [selectedFlashcardSetIds, setSelectedFlashcardSetIds] = useState<
    string[]
  >([]);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (props.type === DialogAddExamType.QUIZZ) {
      if (selectedQuizSetIds.length === 0 || !generatedTest) {
        return;
      }
    } else if (props.type === DialogAddExamType.FLASH_CARD) {
      if (selectedFlashcardSetIds.length === 0 || !generatedCards) {
        return;
      }
    }

    try {
      if (props.type === DialogAddExamType.QUIZZ && generatedTest) {
        await setHistoryQuizzesToQuizset({
          quizsetIds: selectedQuizSetIds,
          historyId: generatedTestId!,
        });
      } else if (
        props.type === DialogAddExamType.FLASH_CARD &&
        generatedCards
      ) {
        await setHistoryFlashcardsToFlashcardSet({
          flashcardsetIds: selectedFlashcardSetIds,
          historyId: generatedCardsId!,
        });
      }

      // Reset and close
      setSelectedQuizSetIds([]);
      setSelectedFlashcardSetIds([]);
      setOpen(false);
    } catch (error) {
      console.error("Error adding to set:", error);
    }
  };

  const hasData =
    (props.type === DialogAddExamType.QUIZZ && generatedTest) ||
    (props.type === DialogAddExamType.FLASH_CARD && generatedCards);

  const loading =
    props.type === DialogAddExamType.QUIZZ ? quizLoading : flashcardLoading;

  const isDisabled =
    loading ||
    !hasData ||
    (props.type === DialogAddExamType.QUIZZ
      ? selectedQuizSetIds.length === 0
      : selectedFlashcardSetIds.length === 0);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{props.children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            <DialogDescription>
              {props.description ||
                `Chọn bộ ${
                  props.type === DialogAddExamType.QUIZZ
                    ? "câu hỏi"
                    : "flashcard"
                } để lưu vào hệ thống`}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {props.type === DialogAddExamType.QUIZZ ? (
              <FormSelectQuizSet
                selectedIds={selectedQuizSetIds}
                onSelectionChange={setSelectedQuizSetIds}
                onCreateSuccess={() => {}}
              />
            ) : (
              <FormSelectFlashcardSet
                selectedIds={selectedFlashcardSetIds}
                onSelectionChange={setSelectedFlashcardSetIds}
                onCreateSuccess={() => {}}
              />
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="border border-destructive text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer flex-1">
                Hủy
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isDisabled}
              className="cursor-pointer flex-1">
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Lưu thay đổi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
