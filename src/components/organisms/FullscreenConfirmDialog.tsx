"use client";

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Maximize, XCircle } from "lucide-react";

interface FullscreenConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * FullscreenConfirmDialog
 * Bắt buộc người dùng xác nhận bật fullscreen trước khi làm bài thi
 * Dialog không thể đóng bằng cách click bên ngoài hoặc ESC
 */
export function FullscreenConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: FullscreenConfirmDialogProps) {
  // Request fullscreen
  const requestFullscreen = async () => {
    try {
      await document.documentElement.requestFullscreen();

      // Disable devtools keyboard shortcuts
      const preventDevTools = (e: KeyboardEvent) => {
        // F12
        if (e.key === "F12") {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+I / Cmd+Option+I
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "i"
        ) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+J / Cmd+Option+J
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "j"
        ) {
          e.preventDefault();
          return false;
        }
        // Ctrl+Shift+C / Cmd+Option+C
        if (
          (e.ctrlKey || e.metaKey) &&
          e.shiftKey &&
          e.key.toLowerCase() === "c"
        ) {
          e.preventDefault();
          return false;
        }
        // Ctrl+U / Cmd+U (view source)
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "u") {
          e.preventDefault();
          return false;
        }
      };

      document.addEventListener("keydown", preventDevTools);

      // Disable right click
      const preventRightClick = (e: MouseEvent) => {
        e.preventDefault();
        return false;
      };
      document.addEventListener("contextmenu", preventRightClick);

      // Store cleanup functions globally
      (window as any).__examCleanupFunctions = {
        preventDevTools,
        preventRightClick,
      };

      // Call onConfirm after fullscreen is enabled
      setTimeout(() => {
        if (document.fullscreenElement) {
          onConfirm();
        }
      }, 100);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
    }
  };

  return (
    <AlertDialog open={open}>
      <AlertDialogContent
        className="sm:max-w-md"
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-xl">
            <Maximize className="h-6 w-6 text-primary" />
            Xác nhận bật chế độ toàn màn hình
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-base text-muted-foreground">
              <p>
                Để đảm bảo tính công bằng và bảo mật, bạn cần bật chế độ toàn
                màn hình (fullscreen) trước khi bắt đầu làm bài thi.
              </p>
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <p className="font-semibold text-foreground">
                  Các hạn chế khi làm bài:
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li>Không thể mở Developer Tools (F12)</li>
                  <li>Không thể click chuột phải</li>
                  <li>Không thể thoát chế độ fullscreen</li>
                  <li>Hệ thống sẽ phát hiện các hành vi gian lận</li>
                </ul>
              </div>
              <p className="text-amber-600 dark:text-amber-500 font-medium">
                ⚠️ Nếu thoát fullscreen hoặc chuyển tab, hành vi sẽ bị ghi nhận.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            className="w-full sm:w-auto">
            <XCircle className="h-4 w-4 mr-2" />
            Hủy bỏ
          </Button>
          <Button
            onClick={requestFullscreen}
            className="w-full sm:w-auto bg-primary">
            <Maximize className="h-4 w-4 mr-2" />
            Đồng ý và bật Fullscreen
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
