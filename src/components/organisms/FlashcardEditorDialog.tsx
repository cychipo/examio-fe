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
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Flashcard } from "@/types/flashcardSet";

interface FlashcardEditorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flashcard: Flashcard | null;
  onSave: (data: FlashcardFormData) => void;
}

export interface FlashcardFormData {
  question: string;
  answer: string;
}

/**
 * Flashcard Editor Dialog Component
 * Modal/Drawer responsive để thêm/sửa flashcard
 * Chỉ có 2 fields: question (front) và answer (back)
 */
export function FlashcardEditorDialog({
  open,
  onOpenChange,
  flashcard,
  onSave,
}: FlashcardEditorDialogProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Form state
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Initialize form khi dialog mở hoặc flashcard thay đổi
  useEffect(() => {
    if (open) {
      if (flashcard) {
        setQuestion(flashcard.question);
        setAnswer(flashcard.answer);
      } else {
        // Reset form
        setQuestion("");
        setAnswer("");
      }
    }
  }, [open, flashcard]);

  const handleSave = () => {
    // Validate
    if (!question.trim()) {
      alert("Vui lòng nhập mặt trước của thẻ");
      return;
    }

    if (!answer.trim()) {
      alert("Vui lòng nhập mặt sau của thẻ");
      return;
    }

    onSave({
      question: question.trim(),
      answer: answer.trim(),
    });

    // Close dialog
    onOpenChange(false);
  };

  const formContent = (
    <div className="space-y-6">
      {/* Question (Front) */}
      <div className="space-y-2">
        <Label htmlFor="question">
          Mặt trước <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          content={question}
          onChange={setQuestion}
          placeholder="Nhập câu hỏi hoặc thuật ngữ..."
          minHeight="150px"
        />
        <p className="text-xs text-muted-foreground">
          💡 Gợi ý: Sử dụng nút 🖼️ trên toolbar để chèn hình ảnh từ URL
        </p>
      </div>

      {/* Answer (Back) */}
      <div className="space-y-2">
        <Label htmlFor="answer">
          Mặt sau <span className="text-destructive">*</span>
        </Label>
        <RichTextEditor
          content={answer}
          onChange={setAnswer}
          placeholder="Nhập câu trả lời hoặc định nghĩa..."
          minHeight="180px"
        />
        <p className="text-xs text-muted-foreground">
          💡 Sử dụng các nút định dạng để làm nổi bật nội dung
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Hủy
        </Button>
        <Button onClick={handleSave}>
          {flashcard ? "Cập nhật" : "Thêm thẻ"}
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
  dark:[&::-webkit-scrollbar-thumb]:bg-neutral-500">
          <DialogHeader>
            <DialogTitle>
              {flashcard ? "Chỉnh sửa thẻ nhớ" : "Thêm thẻ nhớ mới"}
            </DialogTitle>
            <DialogDescription>
              Nhập nội dung cho mặt trước và mặt sau của thẻ nhớ
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
            {flashcard ? "Chỉnh sửa thẻ nhớ" : "Thêm thẻ nhớ mới"}
          </DrawerTitle>
          <DrawerDescription>
            Nhập nội dung cho mặt trước và mặt sau của thẻ nhớ
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-1 pb-4">{formContent}</div>
      </DrawerContent>
    </Drawer>
  );
}
