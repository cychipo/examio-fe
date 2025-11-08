"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Flashcard } from "@/types/flashcardSet";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";

interface FlashcardInlineFormProps {
  flashcard?: Flashcard | null;
  onSave: (data: { question: string; answer: string }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * FlashcardInlineForm - Form inline để thêm/sửa flashcard
 */
export function FlashcardInlineForm({
  flashcard,
  onSave,
  onCancel,
  loading = false,
}: FlashcardInlineFormProps) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  // Load data nếu đang edit
  useEffect(() => {
    if (flashcard) {
      setQuestion(flashcard.question);
      setAnswer(flashcard.answer);
    } else {
      // Reset form khi thêm mới
      setQuestion("");
      setAnswer("");
    }
  }, [flashcard]);

  const handleSubmit = () => {
    // Helper to strip HTML tags for validation
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || "";
    };

    // Validation
    const trimmedQuestion = stripHtml(question).trim();
    const trimmedAnswer = stripHtml(answer).trim();

    if (!trimmedQuestion) {
      alert("Vui lòng nhập câu hỏi (mặt trước)");
      return;
    }

    if (!trimmedAnswer) {
      alert("Vui lòng nhập câu trả lời (mặt sau)");
      return;
    }

    // Send HTML content
    onSave({
      question,
      answer,
    });
  };

  return (
    <Card className="p-6 border-2 border-primary/20 bg-muted/30 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {flashcard ? "Chỉnh sửa flashcard" : "Thêm flashcard mới"}
        </h3>
        <Button
          variant="ghost"
          size="icon"
          onClick={onCancel}
          disabled={loading}
          className="h-8 w-8">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-4">
        {/* Question (Front) */}
        <div className="space-y-2">
          <Label htmlFor="question">
            Mặt trước (Câu hỏi) <span className="text-destructive">*</span>
          </Label>
          <RichTextEditor
            content={question}
            onChange={setQuestion}
            placeholder="Nhập nội dung mặt trước..."
            disabled={loading}
            minHeight="120px"
          />
        </div>

        {/* Answer (Back) */}
        <div className="space-y-2">
          <Label htmlFor="answer">
            Mặt sau (Câu trả lời) <span className="text-destructive">*</span>
          </Label>
          <RichTextEditor
            content={answer}
            onChange={setAnswer}
            placeholder="Nhập nội dung mặt sau..."
            disabled={loading}
            minHeight="150px"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading
              ? "Đang lưu..."
              : flashcard
              ? "Cập nhật"
              : "Thêm flashcard"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
