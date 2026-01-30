"use client";

import { SidebarKit } from "@/components/organisms/k/SideBar";
import { cn } from "@/lib/utils";
import { useAuthSync } from "@/hooks/useAuthSync";
import Image from "next/image";
import Link from "next/link";
import { SunIcon, MoonIcon, RocketIcon } from "@radix-ui/react-icons";
import { AlertTriangle, Mail, X } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useThemeContext } from "@/provider/ThemeProvider";
import { useState, useEffect } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import {
  Announcement,
  AnnouncementTag,
  AnnouncementTitle,
} from "@/components/ui/announcement";
import { useAuthStore } from "@/stores/useAuthStore";
import { useJobStore } from "@/stores/useAIGeneratorStore";
import { useRouter } from "next/navigation";
import { PendingJobDialog } from "@/components/organisms/PendingJobDialog";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync token from localStorage to cookie on mount
  useAuthSync();
  const { user, sendVerificationEmail, loading } = useAuthStore();
  const {
    showPendingJobDialog,
    resumePendingJob,
    cancelPendingJob,
    closePendingJobDialog,
    checkForPendingJob,
  } = useJobStore();
  const { isDarkMode, setTheme } = useThemeContext();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showVerifyAlert, setShowVerifyAlert] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [isCancelingJob, setIsCancelingJob] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check for pending jobs on mount
    checkForPendingJob();
  }, [checkForPendingJob]);

  function handleThemeToggle(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }

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
    // Navigate to ai-tool page to see the result
    router.push("/k/ai-tool");
  };

  const handleCancelJob = async () => {
    setIsCancelingJob(true);
    try {
      await cancelPendingJob();
    } finally {
      setIsCancelingJob(false);
    }
  };

  const showVerificationBanner =
    mounted && user && user.isVerified === false && showVerifyAlert;

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md md:flex-row flex-col relative",
      )}
    >
      <SidebarKit />

      <div className="w-full m-0 pb-20 md:ml-[288px] pt-12">
        {/* Verification Alert Banner */}
        {showVerificationBanner && (
          <div className="w-full bg-amber-500/90 text-white px-3 sm:px-4 py-2 sm:py-2.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-xs sm:text-sm font-medium">
                Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác
                minh tài khoản.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto">
              <button
                onClick={handleResendVerification}
                disabled={sendingEmail || loading}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                {sendingEmail ? "Đang gửi..." : "Gửi lại email"}
              </button>
              <Link
                href="/k/verify"
                className="text-xs bg-white text-yellow-600 hover:bg-white/90 px-3 py-1.5 rounded-lg font-medium transition-colors"
              >
                Xác minh ngay
              </Link>
              <button
                onClick={() => setShowVerifyAlert(false)}
                className="p-1 hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 bg-background/95 w-full md:left-[288px] md:w-[calc(100%-288px)]">
          <div className="container mx-auto py-1 px-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"></div>

              <div className="flex items-center gap-x-3 justify-between">
                {/* FREE_MODE: Ẩn credits display - uncomment để bật lại
                <div className="flex items-center gap-x-2 p-1.5 sm:p-2 rounded-xl cursor-pointer">
                  <div className="text-[11px] sm:text-[12px] text-nowrap font-semibold">
                    {user?.wallet?.balance || 0} Credits
                  </div>
                  <Image src="/coin.png" alt="" width={15} height={15} />
                </div>
                */}

                {/* FREE_MODE: Ẩn upgrade button - uncomment để bật lại
                {mounted && isDesktop && (
                  <Announcement
                    movingBorder
                    className="cursor-pointer"
                    onClick={() => router.push("/k/subscription")}>
                    <AnnouncementTag lustre>Nâng cấp</AnnouncementTag>
                    <AnnouncementTitle>
                      Nâng cấp tài khoản
                      <RocketIcon className="-rotate-45" />
                    </AnnouncementTitle>
                  </Announcement>
                )}

                {mounted && !isDesktop && (
                  <Announcement movingBorder className="cursor-pointer">
                    <RocketIcon className="-rotate-45" />
                  </Announcement>
                )}

                {mounted && (
                  <div className="flex items-center gap-x-1">
                    <SunIcon className="w-4 h-4 cursor-pointer" />
                    <Switch
                      checked={isDarkMode}
                      className="cursor-pointer"
                      onCheckedChange={handleThemeToggle}
                    />
                    <MoonIcon className="w-4 h-4 cursor-pointer" />
                  </div>
                )}
                */}
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>

      {/* Pending Job Dialog */}
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
