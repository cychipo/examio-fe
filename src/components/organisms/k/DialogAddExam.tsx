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

  // Label state for quiz sets and flashcard sets
  const [quizLabelMode, setQuizLabelMode] = useState<"existing" | "new">("new");
  const [quizSelectedLabelId, setQuizSelectedLabelId] = useState<string | null>(null);
  const [quizNewLabelName, setQuizNewLabelName] = useState("");
  const [quizNewLabelColor, setQuizNewLabelColor] = useState("#3B82F6");
  const [quizLabelRefreshKey, setQuizLabelRefreshKey] = useState(0);

  const [flashcardLabelMode, setFlashcardLabelMode] = useState<"existing" | "new">("new");
  const [flashcardSelectedLabelId, setFlashcardSelectedLabelId] = useState<string | null>(null);
  const [flashcardNewLabelName, setFlashcardNewLabelName] = useState("");
  const [flashcardNewLabelColor, setFlashcardNewLabelColor] = useState("#3B82F6");
  const [flashcardLabelRefreshKey, setFlashcardLabelRefreshKey] = useState(0);

  // Reset label state when quizset selection changes
  useEffect(() => {
    setQuizLabelMode("new");
    setQuizSelectedLabelId(null);
    setQuizNewLabelName("");
    setQuizNewLabelColor("#3B82F6");
    setQuizLabelRefreshKey(prev => prev + 1);
  }, [selectedQuizSetIds]);

  // Reset label state when flashcardset selection changes
  useEffect(() => {
    setFlashcardLabelMode("new");
    setFlashcardSelectedLabelId(null);
    setFlashcardNewLabelName("");
    setFlashcardNewLabelColor("#3B82F6");
    setFlashcardLabelRefreshKey(prev => prev + 1);
  }, [selectedFlashcardSetIds]);

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
        // Validate label selection for quiz
        if (selectedQuizSetIds.length === 1) {
          if (quizLabelMode === "existing" && !quizSelectedLabelId) {
            alert("Vui lòng chọn nhãn có sẵn");
            return;
          } else if (quizLabelMode === "new" && !quizNewLabelName.trim()) {
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
          if (quizLabelMode === "existing" && quizSelectedLabelId) {
            credentials.labelId = quizSelectedLabelId;
          } else if (quizLabelMode === "new" && quizNewLabelName.trim()) {
            credentials.labelName = quizNewLabelName.trim();
            credentials.labelColor = quizNewLabelColor;
          }
        }

        await setHistoryQuizzesToQuizset(credentials);
      } else if (
        props.type === DialogAddExamType.FLASH_CARD &&
        generatedCards
      ) {
        // Validate label selection for flashcard
        if (selectedFlashcardSetIds.length === 1) {
          if (flashcardLabelMode === "existing" && !flashcardSelectedLabelId) {
            alert("Vui lòng chọn nhãn có sẵn");
            return;
          } else if (flashcardLabelMode === "new" && !flashcardNewLabelName.trim()) {
            alert("Vui lòng nhập tên nhãn mới");
            return;
          }
        }

        // Build credentials with label info
        const credentials: {
          flashcardsetIds: string[];
          historyId: string;
          labelId?: string;
          labelName?: string;
          labelColor?: string;
        } = {
          flashcardsetIds: selectedFlashcardSetIds,
          historyId: generatedCardsId!,
        };

        // Add label info based on mode (only for single flashcardset)
        if (selectedFlashcardSetIds.length === 1) {
          if (flashcardLabelMode === "existing" && flashcardSelectedLabelId) {
            credentials.labelId = flashcardSelectedLabelId;
          } else if (flashcardLabelMode === "new" && flashcardNewLabelName.trim()) {
            credentials.labelName = flashcardNewLabelName.trim();
            credentials.labelColor = flashcardNewLabelColor;
          }
        }

        await setHistoryFlashcardsToFlashcardSet(credentials);
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
      setQuizLabelMode("new");
      setQuizSelectedLabelId(null);
      setQuizNewLabelName("");
      setQuizNewLabelColor("#3B82F6");
      setQuizLabelRefreshKey(0);
      setFlashcardLabelMode("new");
      setFlashcardSelectedLabelId(null);
      setFlashcardNewLabelName("");
      setFlashcardNewLabelColor("#3B82F6");
      setFlashcardLabelRefreshKey(0);
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
                    key={quizLabelRefreshKey}
                    quizSetId={selectedQuizSetIds[0]}
                    selectedLabelId={quizSelectedLabelId}
                    newLabelName={quizNewLabelName}
                    newLabelColor={quizNewLabelColor}
                    onLabelIdChange={setQuizSelectedLabelId}
                    onNewLabelNameChange={setQuizNewLabelName}
                    onNewLabelColorChange={setQuizNewLabelColor}
                    mode={quizLabelMode}
                    onModeChange={setQuizLabelMode}
                  />
                )}
                {selectedQuizSetIds.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    💡 Chọn 1 bộ đề để có thể gán nhãn cho câu hỏi
                  </p>
                )}
              </>
            ) : (
              <>
                <FormSelectFlashcardSet
                  selectedIds={selectedFlashcardSetIds}
                  onSelectionChange={setSelectedFlashcardSetIds}
                  onCreateSuccess={() => {}}
                />
                {/* Label selector for flashcard - only show when a single flashcardset is selected */}
                {selectedFlashcardSetIds.length === 1 && (
                  <LabelSelector
                    key={flashcardLabelRefreshKey}
                    flashcardSetId={selectedFlashcardSetIds[0]}
                    selectedLabelId={flashcardSelectedLabelId}
                    newLabelName={flashcardNewLabelName}
                    newLabelColor={flashcardNewLabelColor}
                    onLabelIdChange={setFlashcardSelectedLabelId}
                    onNewLabelNameChange={setFlashcardNewLabelName}
                    onNewLabelColorChange={setFlashcardNewLabelColor}
                    mode={flashcardLabelMode}
                    onModeChange={setFlashcardLabelMode}
                  />
                )}
                {selectedFlashcardSetIds.length > 1 && (
                  <p className="text-sm text-muted-foreground">
                    💡 Chọn 1 bộ flashcard để có thể gán nhãn
                  </p>
                )}
              </>
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
