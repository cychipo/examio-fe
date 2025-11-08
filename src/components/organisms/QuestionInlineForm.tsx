"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import { Quizz } from "@/types/quizset";
import { RichTextEditor } from "@/components/molecules/RichTextEditor";

interface QuestionInlineFormProps {
  question?: Quizz | null;
  onSave: (data: {
    question: string;
    options: string[];
    answer: string;
  }) => void;
  onCancel: () => void;
  loading?: boolean;
}

/**
 * QuestionInlineForm - Form inline để thêm/sửa câu hỏi
 * Fixed 4 đáp án (A, B, C, D)
 */
export function QuestionInlineForm({
  question,
  onSave,
  onCancel,
  loading = false,
}: QuestionInlineFormProps) {
  const [questionText, setQuestionText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  // Load data nếu đang edit
  useEffect(() => {
    if (question) {
      setQuestionText(question.question);
      // Đảm bảo có đúng 4 options
      const loadedOptions = [...question.options];
      while (loadedOptions.length < 4) {
        loadedOptions.push("");
      }
      setOptions(loadedOptions.slice(0, 4));
      setCorrectAnswer(question.answer);
    } else {
      // Reset form khi thêm mới
      setQuestionText("");
      setOptions(["", "", "", ""]);
      setCorrectAnswer("");
    }
  }, [question]);

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleSubmit = () => {
    // Helper to strip HTML tags for validation
    const stripHtml = (html: string) => {
      const tmp = document.createElement("div");
      tmp.innerHTML = html;
      return tmp.textContent || "";
    };

    // Validation
    const trimmedQuestion = stripHtml(questionText).trim();
    if (!trimmedQuestion) {
      alert("Vui lòng nhập nội dung câu hỏi");
      return;
    }

    const filledOptions = options
      .map((opt) => stripHtml(opt).trim())
      .filter((opt) => opt);
    if (filledOptions.length < 2) {
      alert("Vui lòng nhập ít nhất 2 đáp án");
      return;
    }

    if (
      !correctAnswer ||
      !stripHtml(options[Number.parseInt(correctAnswer)]).trim()
    ) {
      alert("Vui lòng chọn đáp án đúng");
      return;
    }

    // Gửi data với HTML content (không strip cho actual data)
    onSave({
      question: questionText,
      options,
      answer: correctAnswer,
    });
  };

  const optionLabels = ["A", "B", "C", "D"];

  return (
    <Card className="p-6 border-2 border-primary/20 bg-muted/30 animate-in fade-in slide-in-from-top-4 duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {question ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi mới"}
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
        {/* Question Text */}
        <div className="space-y-2">
          <Label htmlFor="question">
            Nội dung câu hỏi <span className="text-destructive">*</span>
          </Label>
          <RichTextEditor
            content={questionText}
            onChange={setQuestionText}
            placeholder="Nhập nội dung câu hỏi..."
            disabled={loading}
            minHeight="120px"
          />
        </div>

        {/* Options */}
        <div className="space-y-3">
          <Label>
            Đáp án <span className="text-destructive">*</span>
          </Label>
          <RadioGroup value={correctAnswer} onValueChange={setCorrectAnswer}>
            {options.map((option, index) => (
              <div key={index} className="flex items-start gap-3">
                <RadioGroupItem
                  value={index.toString()}
                  id={`option-${index}`}
                  disabled={!options[index].trim() || loading}
                  className="mt-3"
                />
                <div className="flex-1 space-y-1">
                  <Label
                    htmlFor={`option-input-${index}`}
                    className="text-sm font-medium">
                    Đáp án {optionLabels[index]}
                    {index < 2 && <span className="text-destructive"> *</span>}
                  </Label>
                  <RichTextEditor
                    content={option}
                    onChange={(value) => handleOptionChange(index, value)}
                    placeholder={`Nhập đáp án ${optionLabels[index]}...`}
                    disabled={loading}
                    minHeight="80px"
                  />
                </div>
              </div>
            ))}
          </RadioGroup>
          <p className="text-xs text-muted-foreground">
            Chọn radio button bên trái để đánh dấu đáp án đúng
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-2 justify-end pt-4 border-t">
          <Button variant="outline" onClick={onCancel} disabled={loading}>
            Hủy
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Đang lưu..." : question ? "Cập nhật" : "Thêm câu hỏi"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
