"use client";

import { useState, useEffect } from "react";
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
import { LabelSelector } from "@/components/molecules/LabelSelector";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import {
  useTestGeneratorStore,
  useFlashcardGeneratorStore,
} from "@/stores/useAIGeneratorStore";
import { useStatsStore } from "@/stores/useStatsStore";
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
  const { invalidateQuizStats, invalidateFlashcardStats } = useStatsStore();
  const [selectedQuizSetIds, setSelectedQuizSetIds] = useState<string[]>([]);
  const [selectedFlashcardSetIds, setSelectedFlashcardSetIds] = useState<
    string[]
  >([]);
  const [open, setOpen] = useState(false);

  // Label state for quiz sets
  const [labelMode, setLabelMode] = useState<"existing" | "new">(
    "new"
  );
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#3B82F6");
  const [labelRefreshKey, setLabelRefreshKey] = useState(0);

  // Reset label state when quizset selection changes
  useEffect(() => {
    setLabelMode("new");
    setSelectedLabelId(null);
    setNewLabelName("");
    setNewLabelColor("#3B82F6");
    setLabelRefreshKey(prev => prev + 1);
  }, [selectedQuizSetIds]);

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
        // Validate label selection
        if (selectedQuizSetIds.length === 1) {
          if (labelMode === "existing" && !selectedLabelId) {
            alert("Vui lòng chọn nhãn có sẵn");
            return;
          } else if (labelMode === "new" && !newLabelName.trim()) {
            alert("Vui lòng nhập tên nhãn mới");
            return;
          }
        }

        // Build credentials with label info
        const credentials: {
          quizsetIds: string[];
          historyId: string;
          labelId?: string;
          labelName?: string;
          labelColor?: string;
        } = {
          quizsetIds: selectedQuizSetIds,
          historyId: generatedTestId!,
        };

        // Add label info based on mode (only for single quizset)
        if (selectedQuizSetIds.length === 1) {
          if (labelMode === "existing" && selectedLabelId) {
            credentials.labelId = selectedLabelId;
          } else if (labelMode === "new" && newLabelName.trim()) {
            credentials.labelName = newLabelName.trim();
            credentials.labelColor = newLabelColor;
          }
        }

        await setHistoryQuizzesToQuizset(credentials);
      } else if (
        props.type === DialogAddExamType.FLASH_CARD &&
        generatedCards
      ) {
        await setHistoryFlashcardsToFlashcardSet({
          flashcardsetIds: selectedFlashcardSetIds,
          historyId: generatedCardsId!,
        });
      }

      // Invalidate stats
      if (props.type === DialogAddExamType.QUIZZ) {
        invalidateQuizStats();
      } else {
        invalidateFlashcardStats();
      }

      // Reset and close
      setSelectedQuizSetIds([]);
      setSelectedFlashcardSetIds([]);
      setLabelMode("new");
      setSelectedLabelId(null);
      setNewLabelName("");
      setNewLabelColor("#3B82F6");
      setLabelRefreshKey(0);
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
              <>
                <FormSelectQuizSet
                  selectedIds={selectedQuizSetIds}
                  onSelectionChange={setSelectedQuizSetIds}
                  onCreateSuccess={() => {}}
                />
                {/* Label selector - only show when a single quizset is selected */}
                {selectedQuizSetIds.length === 1 && (
                  <LabelSelector
                    key={labelRefreshKey}
                    quizSetId={selectedQuizSetIds[0]}
                    selectedLabelId={selectedLabelId}
                    newLabelName={newLabelName}
                    newLabelColor={newLabelColor}
                    onLabelIdChange={setSelectedLabelId}
                    onNewLabelNameChange={setNewLabelName}
                    onNewLabelColorChange={setNewLabelColor}
                    mode={labelMode}
                    onModeChange={setLabelMode}
                  />
                )}
                {selectedQuizSetIds.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    💡 Chọn 1 bộ đề để có thể gán nhãn cho câu hỏi
                  </p>
                )}
              </>
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
