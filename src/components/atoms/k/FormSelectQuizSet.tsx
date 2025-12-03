"use client";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon, Cross2Icon } from "@radix-ui/react-icons";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Item } from "@/components/ui/item";

interface FormSelectQuizSetProps {
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onCreateSuccess?: () => void; // Callback khi tạo thành công
}

export function FormSelectQuizSet({
  selectedIds,
  onSelectionChange,
  onCreateSuccess,
}: FormSelectQuizSetProps) {
  const { quizSetsK, fetchQuizSets, createQuizSet, loading } =
    useQuizSetStore();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    tags: "",
    isPublic: false,
    isPinned: false,
    thumbnail: null as string | null,
  });

  const handleCheckboxChange = (quizSetId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedIds, quizSetId]);
    } else {
      onSelectionChange(selectedIds.filter((id) => id !== quizSetId));
    }
  };

  useEffect(() => {
    // Chỉ fetch khi chưa có data trong store
    if (quizSetsK.length === 0) {
      fetchQuizSets({ page: 1, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const tagsArray = formData.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0);

    await createQuizSet({
      title: formData.title,
      description: formData.description,
      tags: tagsArray,
      isPublic: formData.isPublic,
      isPinned: formData.isPinned,
      thumbnail: formData.thumbnail,
      questions: [],
      questionCount: 0,
    });

    // Reset form
    setFormData({
      title: "",
      description: "",
      tags: "",
      isPublic: false,
      isPinned: false,
      thumbnail: null,
    });
    setShowCreateForm(false);

    // Gọi callback nếu có
    onCreateSuccess?.();
  };

  const handleCancel = () => {
    setFormData({
      title: "",
      description: "",
      tags: "",
      isPublic: false,
      isPinned: false,
      thumbnail: null,
    });
    setShowCreateForm(false);
  };

  return (
    <div className="grid gap-4">
      {/* Nút tạo mới - luôn hiển thị khi không đang tạo */}
      {!showCreateForm && (
        <div className="flex items-center justify-between gap-4">
          {quizSetsK.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Không có bộ câu hỏi nào. Vui lòng tạo bộ câu hỏi mới.
            </p>
          )}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            className="cursor-pointer ml-auto flex-1">
            <PlusIcon className="w-4 h-4 mr-2" />
            Tạo mới
          </Button>
        </div>
      )}

      {/* Danh sách quiz sets */}
      {quizSetsK.length > 0 && !showCreateForm && (
        <>
          {quizSetsK.map((quizSet) => (
            <Item
              key={quizSet.id}
              variant="outline"
              className="flex items-center justify-between space-y-0 space-x-4">
              <div className="flex flex-1 items-center space-x-4">
                <Checkbox
                  id={quizSet.id}
                  checked={selectedIds.includes(quizSet.id)}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(quizSet.id, checked as boolean)
                  }
                />
                <Label htmlFor={quizSet.id} className="font-medium">
                  {quizSet.title}
                </Label>
                <p className="font-medium text-muted-foreground truncate">
                  {quizSet.description}
                </p>
              </div>
            </Item>
          ))}
        </>
      )}

      {/* Form tạo mới */}
      {showCreateForm && (
        <Card>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium">
                  Tiêu đề <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="VD: Bộ câu hỏi Toán lớp 12"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">
                  Mô tả
                </Label>
                <Input
                  id="description"
                  placeholder="Mô tả ngắn về bộ câu hỏi"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      description: e.target.value,
                    })
                  }
                  className="bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags" className="text-sm font-medium">
                  Tags
                  <span className="text-xs text-muted-foreground ml-2">
                    (phân cách bằng dấu phẩy)
                  </span>
                </Label>
                <Input
                  id="tags"
                  placeholder="VD: toán, đại số, lượng giác"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  className="bg-background"
                />
              </div>

              <div className="flex gap-6">
                <Field>
                  <FieldContent className="flex flex-row items-center gap-x-3">
                    <FieldLabel htmlFor="isPublic" className="cursor-pointer">
                      Công khai
                    </FieldLabel>
                    <Switch
                      id="isPublic"
                      checked={formData.isPublic}
                      className="cursor-pointer"
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPublic: checked })
                      }
                    />
                  </FieldContent>
                </Field>

                <Field>
                  <FieldContent className="flex flex-row items-center gap-x-3">
                    <FieldLabel htmlFor="isPinned" className="cursor-pointer">
                      Ghim
                    </FieldLabel>
                    <Switch
                      id="isPinned"
                      checked={formData.isPinned}
                      className="cursor-pointer"
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, isPinned: checked })
                      }
                    />
                  </FieldContent>
                </Field>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="border border-destructive text-destructive hover:bg-transparent hover:text-destructive cursor-pointer"
                  size="icon"
                  onClick={handleCancel}
                  disabled={loading}>
                  <Cross2Icon className="w-4 h-4" />
                </Button>
                <Button
                  type="button"
                  onClick={handleCreateSubmit}
                  className="flex-1 cursor-pointer"
                  disabled={loading || !formData.title.trim()}>
                  {loading ? "Đang tạo..." : "Tạo bộ câu hỏi"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
