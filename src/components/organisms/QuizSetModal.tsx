"use client";

import { useIsDesktop } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  QuizSetForm,
  QuizSetFormData,
} from "@/components/molecules/QuizSetForm";

interface QuizSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: QuizSetFormData;
  isLoading?: boolean;
  onSubmit: (data: QuizSetFormData) => void;
}

/**
 * Modal/Drawer component cho QuizSet (Create/Edit)
 * Tự động chuyển đổi giữa Dialog (desktop/tablet) và Drawer (mobile)
 * tuân thủ responsive design
 */
export function QuizSetModal({
  open,
  onOpenChange,
  mode,
  initialData,
  isLoading,
  onSubmit,
}: QuizSetModalProps) {
  const isDesktop = useIsDesktop();

  const title = mode === "create" ? "Tạo đề thi mới" : "Chỉnh sửa đề thi";
  const submitLabel = mode === "create" ? "Tạo đề thi" : "Lưu thay đổi";

  const handleClose = () => {
    if (!isLoading) {
      onOpenChange(false);
    }
  };

  // Desktop và Tablet: sử dụng Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          <QuizSetForm
            key={initialData ? JSON.stringify(initialData) : "create"}
            initialData={initialData}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onCancel={handleClose}
            submitLabel={submitLabel}
          />
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: sử dụng Drawer
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh] px-4 pb-24">
        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
        </DrawerHeader>
        <div className="overflow-y-auto px-1 pb-4">
          <QuizSetForm
            key={initialData ? JSON.stringify(initialData) : "create"}
            initialData={initialData}
            isLoading={isLoading}
            onSubmit={onSubmit}
            onCancel={handleClose}
            submitLabel={submitLabel}
          />
        </div>
      </DrawerContent>
    </Drawer>
  );
}
