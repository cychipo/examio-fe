"use client";

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
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import {
  ExamRoomForm,
  ExamRoomFormData,
} from "@/components/molecules/ExamRoomForm";

interface QuizSetOption {
  id: string;
  title: string;
  questionCount?: number;
}

interface ExamRoomModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: ExamRoomFormData;
  quizSets: QuizSetOption[];
  isLoading?: boolean;
  isLoadingQuizSets?: boolean;
  onSubmit: (data: ExamRoomFormData) => void;
}

/**
 * Modal component responsive cho ExamRoom
 * - Desktop/Tablet: Dialog
 * - Mobile: Drawer
 * Tuân thủ atomic design pattern (Organism level)
 */
export function ExamRoomModal({
  open,
  onOpenChange,
  mode,
  initialData,
  quizSets,
  isLoading = false,
  isLoadingQuizSets = false,
  onSubmit,
}: ExamRoomModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const title = mode === "create" ? "Tạo phòng thi mới" : "Chỉnh sửa phòng thi";

  const handleCancel = () => {
    onOpenChange(false);
  };

  // Render Dialog cho desktop/tablet
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {mode === "create"
                ? "Điền thông tin để tạo phòng thi mới"
                : "Cập nhật thông tin phòng thi"}
            </DialogDescription>
          </DialogHeader>
          <ExamRoomForm
            initialData={initialData}
            quizSets={quizSets}
            isLoading={isLoading}
            isLoadingQuizSets={isLoadingQuizSets}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            submitLabel={mode === "create" ? "Tạo phòng thi" : "Lưu thay đổi"}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Render Drawer cho mobile
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] px-4 pb-24">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <DrawerDescription>
            {mode === "create"
              ? "Điền thông tin để tạo phòng thi mới"
              : "Cập nhật thông tin phòng thi"}
          </DrawerDescription>
        </DrawerHeader>
        <div className="overflow-y-auto px-1 pb-4">
          <ExamRoomForm
            initialData={initialData}
            quizSets={quizSets}
            isLoading={isLoading}
            isLoadingQuizSets={isLoadingQuizSets}
            onSubmit={onSubmit}
            onCancel={handleCancel}
            submitLabel={mode === "create" ? "Tạo phòng thi" : "Lưu thay đổi"}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
