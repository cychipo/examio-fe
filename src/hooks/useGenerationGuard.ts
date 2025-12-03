"use client";

import { useEffect, useCallback } from "react";
import { useJobStore } from "@/stores/useAIGeneratorStore";

/**
 * Hook to guard against page reload/close when AI generation is in progress.
 * This uses the browser's native beforeunload event to warn users.
 *
 * Note: Modern browsers limit what can be done in beforeunload for security reasons.
 * We cannot show custom dialogs or make async calls during beforeunload.
 * Instead, we show the native browser confirmation dialog.
 *
 * If the user confirms reload, the job will be orphaned on the server.
 * The store's checkAndCleanupPendingJob will handle cleanup on next page load.
 */
export function useGenerationGuard(isGenerating: boolean) {
  const { currentJobId, cancelCurrentJob, checkAndCleanupPendingJob } =
    useJobStore();

  // Check for orphaned jobs on mount
  useEffect(() => {
    checkAndCleanupPendingJob();
  }, [checkAndCleanupPendingJob]);

  // Handle beforeunload event
  const handleBeforeUnload = useCallback(
    (event: BeforeUnloadEvent) => {
      if (isGenerating && currentJobId) {
        // Standard way to trigger the browser's native confirmation dialog
        event.preventDefault();
        // Some browsers require returnValue to be set
        event.returnValue = "Đang tạo đề/flashcard. Bạn có chắc muốn rời đi?";
        return "Đang tạo đề/flashcard. Bạn có chắc muốn rời đi?";
      }
    },
    [isGenerating, currentJobId]
  );

  // Handle visibility change (tab switch, minimize)
  const handleVisibilityChange = useCallback(() => {
    if (document.visibilityState === "hidden" && isGenerating && currentJobId) {
      console.log(
        "🔄 Page hidden while generating, job continues on server..."
      );
    }
  }, [isGenerating, currentJobId]);

  // Handle online/offline events
  const handleOffline = useCallback(() => {
    if (isGenerating && currentJobId) {
      console.log("📴 Network offline while generating");
      // Job continues on server, we'll resume polling when back online
    }
  }, [isGenerating, currentJobId]);

  const handleOnline = useCallback(() => {
    if (isGenerating && currentJobId) {
      console.log("📶 Network back online, resuming polling...");
      // The polling should auto-resume since it's still running
    }
  }, [isGenerating, currentJobId]);

  useEffect(() => {
    // Add event listeners
    window.addEventListener("beforeunload", handleBeforeUnload);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("online", handleOnline);

    return () => {
      // Cleanup
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("online", handleOnline);
    };
  }, [handleBeforeUnload, handleVisibilityChange, handleOffline, handleOnline]);

  // Return a function to manually cancel the current job
  return {
    cancelCurrentJob,
    currentJobId,
  };
}
