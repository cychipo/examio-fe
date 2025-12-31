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
  FlashcardSetForm,
  FlashcardSetFormData,
} from "@/components/molecules/FlashcardSetForm";

interface FlashcardSetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: "create" | "edit";
  initialData?: FlashcardSetFormData;
  isLoading?: boolean;
  onSubmit: (data: FlashcardSetFormData) => void;
}

/**
 * Modal/Drawer component cho FlashcardSet (Create/Edit)
 * Tự động chuyển đổi giữa Dialog (desktop/tablet) và Drawer (mobile)
 * tuân thủ responsive design
 */
export function FlashcardSetModal({
  open,
  onOpenChange,
  mode,
  initialData,
  isLoading,
  onSubmit,
}: FlashcardSetModalProps) {
  const isDesktop = useIsDesktop();

  const title =
    mode === "create" ? "Tạo bộ flashcard mới" : "Chỉnh sửa bộ flashcard";
  const submitLabel = mode === "create" ? "Tạo flashcard" : "Lưu thay đổi";

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
          <FlashcardSetForm
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
          <FlashcardSetForm
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
