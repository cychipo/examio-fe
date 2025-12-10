"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import {
  logCheatingViolationApi,
  CHEATING_TYPE,
  CHEATING_TYPE_LABELS,
} from "@/apis/cheatingLogApi";

interface UseCheatingDetectionOptions {
  examAttemptId: string;
  enabled?: boolean;
  onViolation?: (type: CHEATING_TYPE, count: number) => void;
}

interface CheatingDetectionState {
  totalViolations: number;
  lastViolationType: CHEATING_TYPE | null;
  isWarningVisible: boolean;
}

/**
 * Hook to detect and log cheating behaviors during exam
 * Tracks: tab switch, window blur, devtools, copy/paste, right-click, fullscreen exit
 */
export function useCheatingDetection({
  examAttemptId,
  enabled = true,
  onViolation,
}: UseCheatingDetectionOptions) {
  const [state, setState] = useState<CheatingDetectionState>({
    totalViolations: 0,
    lastViolationType: null,
    isWarningVisible: false,
  });

  const isLoggingRef = useRef(false);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Log violation to server
  const logViolation = useCallback(
    async (type: CHEATING_TYPE) => {
      if (!enabled || !examAttemptId || isLoggingRef.current) return;

      isLoggingRef.current = true;
      try {
        const result = await logCheatingViolationApi(examAttemptId, type);
        if (result.logged && result.totalViolations !== undefined) {
          setState((prev) => ({
            ...prev,
            totalViolations: result.totalViolations!,
            lastViolationType: type,
            isWarningVisible: true,
          }));

          onViolation?.(type, result.count || 1);

          // Auto-hide warning after 3 seconds
          if (warningTimeoutRef.current) {
            clearTimeout(warningTimeoutRef.current);
          }
          warningTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, isWarningVisible: false }));
          }, 3000);
        }
      } catch (error) {
        console.error("Failed to log violation:", error);
      } finally {
        isLoggingRef.current = false;
      }
    },
    [enabled, examAttemptId, onViolation]
  );

  // Dismiss warning manually
  const dismissWarning = useCallback(() => {
    setState((prev) => ({ ...prev, isWarningVisible: false }));
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Tab visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        logViolation(CHEATING_TYPE.TAB_SWITCH);
      }
    };

    // Window blur
    const handleBlur = () => {
      logViolation(CHEATING_TYPE.WINDOW_BLUR);
    };

    // DevTools detection (F12, Ctrl+Shift+I/J/C)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey &&
          e.shiftKey &&
          ["I", "i", "J", "j", "C", "c"].includes(e.key))
      ) {
        e.preventDefault();
        logViolation(CHEATING_TYPE.DEVTOOLS_OPEN);
      }
      // Print screen
      if (e.key === "PrintScreen") {
        logViolation(CHEATING_TYPE.PRINT_SCREEN);
      }
    };

    // Copy/Paste/Cut
    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation(CHEATING_TYPE.COPY_PASTE);
    };
    const handlePaste = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation(CHEATING_TYPE.COPY_PASTE);
    };
    const handleCut = (e: ClipboardEvent) => {
      e.preventDefault();
      logViolation(CHEATING_TYPE.COPY_PASTE);
    };

    // Right click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      logViolation(CHEATING_TYPE.RIGHT_CLICK);
    };

    // Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logViolation(CHEATING_TYPE.FULLSCREEN_EXIT);
      }
    };

    // Add listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("copy", handleCopy);
    document.addEventListener("paste", handlePaste);
    document.addEventListener("cut", handleCut);
    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("copy", handleCopy);
      document.removeEventListener("paste", handlePaste);
      document.removeEventListener("cut", handleCut);
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);

      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [enabled, logViolation]);

  return {
    ...state,
    dismissWarning,
    getViolationLabel: (type: CHEATING_TYPE) => CHEATING_TYPE_LABELS[type],
  };
}
