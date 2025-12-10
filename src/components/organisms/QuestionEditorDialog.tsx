"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Plus, X } from "lucide-react";
import { Quizz } from "@/types/quizset";

interface QuestionEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  question: Quizz | null;
  onSave: (data: QuestionFormData) => void;
}

export interface QuestionFormData {
  question: string;
  options: string[];
  answer: string;
}

/**
 * Question Editor Dialog Component
 * Modal/Drawer responsive để thêm/sửa câu hỏi
 * Hỗ trợ rich text (textarea) cho câu hỏi và đáp án
 */
export function QuestionEditorDialog({
  open,
  onOpenChange,
  question,
  onSave,
}: QuestionEditorDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Form state
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState("");

  // Helper: Convert letter answer (A, B, C, D) to index
  const letterToIndex = (letter: string): string => {
    if (!letter) return "";
    // If it's already a number, return as is
    if (!Number.isNaN(Number.parseInt(letter))) return letter;
    // Convert letter to index (A=0, B=1, C=2, D=3)
    return (letter.charCodeAt(0) - 65).toString();
  };

  // Helper: Convert index to letter answer
  const indexToLetter = (index: string): string => {
    if (!index) return "";
    const num = Number.parseInt(index);
    if (Number.isNaN(num)) return index;
    return String.fromCharCode(65 + num);
  };

  // Initialize form khi dialog mở hoặc question thay đổi
  useEffect(() => {
    if (open) {
      if (question) {
        setQuestionText(question.question);
        const filledOptions =
          question.options.length >= 4
            ? question.options
            : ([
                ...question.options,
                ...Array.from({
                  length: 4 - question.options.length,
                }).fill(""),
              ] as string[]);
        setOptions(filledOptions);
        // Convert letter answer to index for radio selection
        setCorrectAnswer(letterToIndex(question.answer));
      } else {
        // Reset form
        setQuestionText("");
        setOptions(["", "", "", ""]);
        setCorrectAnswer("");
      }
    }
  }, [open, question]);

  const handleAddOption = () => {
    setOptions([...options, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
      // If removed option was the correct answer, reset
      if (correctAnswer === index.toString()) {
        setCorrectAnswer("");
      } else if (Number.parseInt(correctAnswer) > index) {
        // Adjust the correct answer index if it's after the removed option
        setCorrectAnswer((Number.parseInt(correctAnswer) - 1).toString());
      }
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSave = () => {
    // Validate
    if (!questionText.trim()) {
      alert("Vui lòng nhập câu hỏi");
      return;
    }

    const filledOptions = options.filter((opt) => opt.trim());
    if (filledOptions.length < 2) {
      alert("Vui lòng nhập ít nhất 2 đáp án");
      return;
    }

    if (!correctAnswer || !options[Number.parseInt(correctAnswer)].trim()) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }

    onSave({
      question: questionText,
      options: filledOptions,
      answer: indexToLetter(correctAnswer),
    });

    // Close dialog
    onOpenChange(false);
  };

  const formContent = (
    <div className="space-y-6">
      {/* Question Text */}
      <div className="space-y-2">
        <Label htmlFor="question">
          Câu hỏi <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          content={questionText}
          onChange={setQuestionText}
          placeholder="Nhập nội dung câu hỏi..."
          minHeight="150px"
        />
      </div>

      {/* Options */}
      <div className="space-y-4">
        <Label>
          Đáp án <span className="text-destructive">*</span>
        </Label>

        <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
          {options.map((option, index) => (
            <div key={index} className="flex items-start gap-2">
              <RadioGroupItem
                value={index.toString()}
                id={`option-${index}`}
                disabled={!option.trim()}
                className="mt-3"
              />
              <div className="flex-1 flex gap-2">
                <div className="flex-shrink-0 mt-3 font-semibold text-lg text-muted-foreground">
                  {String.fromCharCode(65 + index)}.
                </div>
                <div className="flex-1">
                  <RichTextEditor
                    content={option}
                    onChange={(value) => handleOptionChange(index, value)}
                    placeholder={`Nhập đáp án ${String.fromCharCode(
                      65 + index
                    )}`}
                    minHeight="100px"
                  />
                </div>
              </div>
              {options.length > 2 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveOption(index)}
                  className="mt-2">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </RadioGroup>

        {options.length < 6 && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddOption}
            className="w-full">
            <Plus className="mr-2 h-4 w-4" />
            Thêm đáp án
          </Button>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSave}>
          {question ? "Cập nhật" : "Thêm câu hỏi"}
        </Button>
      </div>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent
          className="!max-w-4xl max-h-[90vh] overflow-y-auto  [&::-webkit-scrollbar]:w-0.5
  [&::-webkit-scrollbar-track]:bg-gray-100
  [&::-webkit-scrollbar-thumb]:bg-gray-300
  dark:[&::-webkit-scrollbar-track]:bg-neutral-700
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500"
          onCloseAutoFocus={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              {question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập nội dung câu hỏi và các đáp án. Chọn đáp án đúng bằng radio
              button.
            </DialogDescription>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] px-4 pb-8">
        <DrawerHeader>
          <DrawerTitle>
            {question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
          </DrawerTitle>
          <DrawerDescription>
            Nhập nội dung câu hỏi và các đáp án
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-1 pb-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
