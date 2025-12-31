"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { ThumbnailUpload } from "@/components/atoms/k/ThumbnailUpload";

/**
 * Interface cho dữ liệu form FlashcardSet
 */
export interface FlashcardSetFormData {
  title: string;
  description: string;
  isPublic: boolean;
  isPinned: boolean;
  tags: string[];
  thumbnail?: string | File | null;
}

interface FlashcardSetFormProps {
  initialData?: FlashcardSetFormData;
  isLoading?: boolean;
  onSubmit: (data: FlashcardSetFormData) => void;
  onCancel: () => void;
  submitLabel?: string;
}

/**
 * Form component để tạo/chỉnh sửa Flashcard Set
 * Tuân thủ atomic design pattern
 */
export function FlashcardSetForm({
  initialData,
  isLoading = false,
  onSubmit,
  onCancel,
  submitLabel = "Lưu",
}: FlashcardSetFormProps) {
  // State quản lý form data - khởi tạo từ initialData nếu có
  const [formData, setFormData] = useState<FlashcardSetFormData>(
    initialData || {
      title: "",
      description: "",
      isPublic: false,
      isPinned: false,
      tags: [],
      thumbnail: "",
    }
  );

  const [tagInput, setTagInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

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

  /**
   * Thêm tag mới
   */
  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !formData.tags.includes(trimmedTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, trimmedTag],
      }));
      setTagInput("");
    }
  };

  /**
   * Xóa tag
   */
  const handleRemoveTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t: string) => t !== tagToRemove),
    }));
  };

  /**
   * Xử lý enter key khi nhập tag
   */
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
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
          placeholder="Nhập tiêu đề bộ flashcard"
          disabled={isLoading}
          className={errors.title ? "border-red-500" : ""}
        />
        {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
      </div>

      {/* Mô tả */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => {
            setFormData({ ...formData, description: e.target.value });
            if (errors.description) {
              setErrors({ ...errors, description: "" });
            }
          }}
          placeholder="Nhập mô tả cho bộ flashcard"
          disabled={isLoading}
          rows={4}
          className={`w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
            errors.description ? "border-red-500" : ""
          }`}
        />
        {errors.description && (
          <p className="text-sm text-red-500">{errors.description}</p>
        )}
      </div>

      {/* Thumbnail Upload */}
      <div className="space-y-2">
        <ThumbnailUpload
          label="Thumbnail"
          value={formData.thumbnail}
          onChange={(value) => setFormData({ ...formData, thumbnail: value })}
        />
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label htmlFor="tags">Tags</Label>
        <div className="flex gap-2">
          <Input
            id="tags"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Nhập tag và nhấn Enter"
            disabled={isLoading}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleAddTag}
            disabled={isLoading || !tagInput.trim()}>
            Thêm
          </Button>
        </div>
        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.tags.map((tag: string) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 text-sm">
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  disabled={isLoading}
                  className="ml-1 hover:text-blue-600 dark:hover:text-blue-200"
                  aria-label={`Xóa tag ${tag}`}>
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Switch options */}
      <div className="space-y-3 pt-2 flex items-center justify-between w-full">
        <Label htmlFor="isPublic" className="cursor-pointer">
          Công khai
        </Label>
        <Switch
          id="isPublic"
          checked={formData.isPublic}
          onCheckedChange={(checked) =>
            setFormData({ ...formData, isPublic: checked })
          }
          disabled={isLoading}
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
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
