"use client";

import { AlertTriangle } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CHEATING_TYPE, CHEATING_TYPE_LABELS } from "@/apis/cheatingLogApi";

interface CheatingWarningModalProps {
  open: boolean;
  onClose: () => void;
  violationType: CHEATING_TYPE | null;
  totalViolations: number;
}

/**
 * Warning modal shown when cheating is detected
 */
export function CheatingWarningModal({
  open,
  onClose,
  violationType,
  totalViolations,
}: CheatingWarningModalProps) {
  const violationLabel = violationType
    ? CHEATING_TYPE_LABELS[violationType]
    : "Vi phạm";

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogContent className="sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Cảnh báo vi phạm!
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-2">
            <p>
              Hành vi{" "}
              <strong className="text-foreground">{violationLabel}</strong> đã
              được ghi nhận.
            </p>
            <p className="text-sm">
              Tổng số lần vi phạm:{" "}
              <span className="font-semibold text-destructive">
                {totalViolations}
              </span>
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Các hành vi vi phạm sẽ được giám thị xem xét sau khi kết thúc bài
              thi.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onClose}>Đã hiểu</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
