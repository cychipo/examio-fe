"use client";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Maximize, XCircle, ShieldCheck, Loader2 } from "lucide-react";
import { useGoogleReCaptcha } from "react-google-recaptcha-v3";
import { toast } from "@/components/ui/toast";

interface FullscreenConfirmDialogProps {
  open: boolean;
  onConfirm: (token?: string) => void;
  onCancel: () => void;
}

/**
 * FullscreenConfirmDialog
 * Bắt buộc người dùng xác nhận bật fullscreen trước khi làm bài thi
 * Yêu cầu xác thực CAPTCHA v3 để chống bot
 */
export function FullscreenConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: FullscreenConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const { executeRecaptcha } = useGoogleReCaptcha();

  // Request fullscreen
  const requestFullscreen = async () => {
    setLoading(true);
    try {
      // Execute reCAPTCHA v3
      if (!executeRecaptcha) {
        toast.error("Chưa tải được dịch vụ bảo mật", {
          description: "Vui lòng tải lại trang và thử lại",
        });
        setLoading(false);
        return;
      }

      const token = await executeRecaptcha("fullscreen_exam");

      if (!token) {
        toast.error("Xác thực bảo mật thất bại");
        setLoading(false);
        return;
      }

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

      // Call onConfirm after fullscreen is enabled with the token
      setTimeout(() => {
        if (document.fullscreenElement) {
          onConfirm(token);
        }
      }, 100);
    } catch (error) {
      console.error("Failed to enter fullscreen:", error);
      toast.error("Không thể bật chế độ toàn màn hình");
    } finally {
      setLoading(false);
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
            <div className="space-y-4 text-base text-muted-foreground">
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

              <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <span>Được bảo vệ bởi Google reCAPTCHA v3</span>
              </div>

              <p className="text-amber-600 dark:text-amber-500 font-medium text-center">
                ⚠️ Nếu thoát fullscreen hoặc chuyển tab, hành vi sẽ bị ghi nhận.
              </p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={loading}
            className="w-full sm:w-auto">
            <XCircle className="h-4 w-4 mr-2" />
            Hủy bỏ
          </Button>
          <Button
            onClick={requestFullscreen}
            disabled={loading}
            className="w-full sm:w-auto bg-primary">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Maximize className="h-4 w-4 mr-2" />
                Vào thi ngay
              </>
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
