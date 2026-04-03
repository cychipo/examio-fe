import type { PropsWithChildren } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import { AlertTriangle, Mail, X } from "lucide-react";
import { SidebarKit } from "@/components/organisms/k/SideBar";
import { PendingJobDialog } from "@/components/organisms/PendingJobDialog";
import { cn } from "@/lib/utils";
import { useAuthSync } from "@/hooks/useAuthSync";
import { useAuthStore } from "@/stores/useAuthStore";
import { useJobStore } from "@/stores/useAIGeneratorStore";

export function KLayout({ children }: PropsWithChildren) {
  useAuthSync();

  const location = useLocation();
  const navigate = useNavigate();
  const { user, sendVerificationEmail, loading } = useAuthStore();
  const {
    showPendingJobDialog,
    resumePendingJob,
    cancelPendingJob,
    closePendingJobDialog,
  } = useJobStore();
  const [showVerifyAlert, setShowVerifyAlert] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isCancelingJob, setIsCancelingJob] = useState(false);

  const handleResendVerification = async () => {
    setSendingEmail(true);
    try {
      await sendVerificationEmail();
    } catch (error) {
      console.error("Failed to send verification email:", error);
    } finally {
      setSendingEmail(false);
    }
  };

  const handleContinueJob = () => {
    resumePendingJob();
    navigate("/k/ai-tool");
  };

  const handleCancelJob = async () => {
    setIsCancelingJob(true);
    try {
      await cancelPendingJob();
    } finally {
      setIsCancelingJob(false);
    }
  };

  const showVerificationBanner = user && user.isVerified === false && showVerifyAlert;

  return (
    <div
      className={cn(
        "mx-auto flex min-h-screen w-full flex-1 flex-col overflow-x-hidden overflow-y-auto rounded-md md:flex-row",
      )}
    >
      <SidebarKit />

      <div className="m-0 w-full pb-20 pt-12 md:ml-[288px]">
        {showVerificationBanner && (
          <div className="flex w-full flex-col items-start justify-between gap-2 bg-amber-500/90 px-3 py-2 text-white sm:flex-row sm:items-center sm:gap-4 sm:px-4 sm:py-2.5">
            <div className="flex flex-1 items-center gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <p className="text-xs font-medium sm:text-sm">
                Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác minh tài khoản.
              </p>
            </div>
            <div className="flex w-full flex-shrink-0 items-center gap-2 sm:w-auto">
              <button
                onClick={handleResendVerification}
                disabled={sendingEmail || loading}
                className="flex items-center gap-1.5 rounded-lg bg-white/20 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/30 disabled:opacity-50"
              >
                <Mail className="h-3.5 w-3.5" />
                {sendingEmail ? "Đang gửi..." : "Gửi lại email"}
              </button>
              <Link
                to="/k/verify"
                state={{ from: location.pathname }}
                className="rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-yellow-600 transition-colors hover:bg-white/90"
              >
                Xác minh ngay
              </Link>
              <button
                onClick={() => setShowVerifyAlert(false)}
                className="p-1 transition-colors hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        <header className="fixed left-0 right-0 top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-sm md:left-[288px] md:w-[calc(100%-288px)]">
          <div className="container mx-auto w-full px-2 py-1">
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-3" />
              <div className="flex items-center justify-between gap-x-3" />
            </div>
          </div>
        </header>

        {children}
      </div>

      <PendingJobDialog
        open={showPendingJobDialog}
        onOpenChange={closePendingJobDialog}
        isLoading={isCancelingJob}
        onContinue={handleContinueJob}
        onCancel={handleCancelJob}
      />
    </div>
  );
}
