"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Interface cho dữ liệu form ExamRoom
 * Security fields (assessType, allowRetake, maxAttempts) đã được chuyển sang ExamSession
 */
export interface ExamRoomFormData {
  title: string;
  description?: string;
  quizSetId: string;
}

interface QuizSetOption {
  id: string;
  title: string;
  questionCount?: number;
}

interface ExamRoomFormProps {
  initialData?: ExamRoomFormData;
  quizSets: QuizSetOption[]; // Danh sách quiz sets để chọn
  isLoading?: boolean;
  isLoadingQuizSets?: boolean;
  onSubmit: (data: ExamRoomFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

/**
 * Form component để tạo/chỉnh sửa Exam Room
 * Tuân thủ atomic design pattern
 */
export function ExamRoomForm({
  initialData,
  quizSets,
  isLoading = false,
  isLoadingQuizSets = false,
  onSubmit,
  onCancel,
  submitLabel = "Lưu",
}: ExamRoomFormProps) {
  // State quản lý form data
  const [formData, setFormData] = useState<ExamRoomFormData>({
    title: "",
    description: "",
    quizSetId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load initial data nếu có (cho edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  /**
   * Validate form data
   * @returns true nếu valid, false nếu có lỗi
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Tiêu đề không được để trống";
    } else if (formData.title.length > 200) {
      newErrors.title = "Tiêu đề không được vượt quá 200 ký tự";
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = "Mô tả không được vượt quá 1000 ký tự";
    }

    if (!formData.quizSetId) {
      newErrors.quizSetId = "Vui lòng chọn bộ đề thi";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Xử lý submit form
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Tiêu đề */}
      <div className="space-y-2">
        <Label htmlFor="title" className="required">
          Tiêu đề <span className="text-red-500">*</span>
        </Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => {
            setFormData({ ...formData, title: e.target.value });
            if (errors.title) {
              setErrors({ ...errors, title: "" });
            }
          }}
          placeholder="Nhập tiêu đề phòng thi"
          disabled={isLoading}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) {
              setErrors({ ...errors, description: "" });
            }
          }}
          placeholder="Nhập mô tả phòng thi (tùy chọn)"
          disabled={isLoading}
          className={errors.description ? "border-red-500" : ""}
          rows={3}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Chọn bộ đề */}
      <div className="space-y-2 w-full">
        <Label htmlFor="quizSetId">
          Bộ đề thi <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.quizSetId || initialData?.quizSetId}
          onValueChange={(value) => {
            setFormData({ ...formData, quizSetId: value });
            if (errors.quizSetId) {
              setErrors({ ...errors, quizSetId: "" });
            }
          }}
          disabled={isLoading || isLoadingQuizSets}>
          <SelectTrigger
            className={cn(errors.quizSetId ? "border-red-500" : "", "w-full")}>
            <SelectValue
              placeholder="Chọn bộ đề thi"
              className="hover:dark:text-white hover:text-black"
            />
          </SelectTrigger>
          <SelectContent>
            {isLoadingQuizSets ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="ml-2 text-sm">Đang tải...</span>
              </div>
            ) : quizSets.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Không có bộ đề nào
              </div>
            ) : (
              quizSets.map((quizSet) => (
                <SelectItem
                  key={quizSet.id}
                  value={quizSet.id}
                  className="hover:dark:text-white hover:text-black">
                  {quizSet.title}
                  {quizSet.questionCount && (
                    <span className="ml-2 text-xs text-muted-foreground">
                      ({quizSet.questionCount} câu hỏi)
                    </span>
                  )}
                </SelectItem>
              ))
            )}
          </SelectContent>
        </Select>
        {errors.quizSetId && (
          <p className="text-sm text-red-500">{errors.quizSetId}</p>
        )}
      </div>

      {/* Info note */}
      <div className="rounded-lg border p-4 bg-muted/50">
        <p className="text-sm text-muted-foreground">
          💡 <strong>Lưu ý:</strong> Các cài đặt bảo mật như loại phòng thi, cho
          phép thi lại, mã truy cập... sẽ được cấu hình cho từng phiên thi riêng
          lẻ.
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}>
          Hủy
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
