"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Loader2 } from "lucide-react";

interface PendingJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isLoading?: boolean;
  onContinue: () => void;
  onCancel: () => void;
}

/**
 * Dialog để hỏi user khi có job đang pending từ session trước
 * - Continue: Resume polling job hiện tại
 * - Cancel: Hủy job và rollback
 */
export function PendingJobDialog({
  open,
  onOpenChange,
  isLoading = false,
  onContinue,
  onCancel,
}: PendingJobDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Phát hiện tác vụ đang chạy</AlertDialogTitle>
          <AlertDialogDescription>
            Có một tác vụ tạo đề/flashcard đang được xử lý từ trước đó. Bạn muốn
            tiếp tục theo dõi hay hủy tác vụ này?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            disabled={isLoading}
            onClick={onCancel}
            className="bg-red-600 hover:bg-red-700 text-white border-0">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Hủy tác vụ
          </AlertDialogCancel>
          <AlertDialogAction onClick={onContinue} disabled={isLoading}>
            Tiếp tục theo dõi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
