"use client";

import { useState, useRef } from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Maximize, XCircle, ShieldCheck } from "lucide-react";
import ReCAPTCHA from "react-google-recaptcha";
import { useTheme } from "next-themes";

interface FullscreenConfirmDialogProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * FullscreenConfirmDialog
 * Bắt buộc người dùng xác nhận bật fullscreen trước khi làm bài thi
 * Yêu cầu xác thực CAPTCHA để chống bot
 */
export function FullscreenConfirmDialog({
  open,
  onConfirm,
  onCancel,
}: FullscreenConfirmDialogProps) {
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const { theme } = useTheme();
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  const handleCaptchaChange = (token: string | null) => {
    setCaptchaToken(token);
  };

  // Request fullscreen
  const requestFullscreen = async () => {
    // Validate CAPTCHA
    if (!captchaToken) {
      return;
    }

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

  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

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

              {/* CAPTCHA Section */}
              <div className="flex flex-col items-center justify-center p-4 border rounded-lg bg-background/50">
                <p className="text-sm font-medium mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primary" />
                  Xác thực bạn không phải là robot
                </p>
                {siteKey ? (
                  <ReCAPTCHA
                    ref={recaptchaRef}
                    sitekey={siteKey}
                    onChange={handleCaptchaChange}
                    theme={theme === "dark" ? "dark" : "light"}
                  />
                ) : (
                  <div className="p-3 text-sm text-destructive bg-destructive/10 rounded">
                    Chưa cấu hình Google reCAPTCHA Site Key
                  </div>
                )}
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
            className="w-full sm:w-auto">
            <XCircle className="h-4 w-4 mr-2" />
            Hủy bỏ
          </Button>
          <Button
            onClick={requestFullscreen}
            disabled={!captchaToken}
            className="w-full sm:w-auto bg-primary">
            <Maximize className="h-4 w-4 mr-2" />
            {captchaToken ? "Vào thi ngay" : "Vui lòng xác thực CAPTCHA"}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
