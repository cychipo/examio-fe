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
import { useRouter } from "next/navigation";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync token from localStorage to cookie on mount
  useAuthSync();
  const { user, sendVerificationEmail, loading } = useAuthStore();
  const { isDarkMode, setTheme } = useThemeContext();
  const isDesktop = useIsDesktop();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [showVerifyAlert, setShowVerifyAlert] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const showVerificationBanner =
    mounted && user && user.isVerified === false && showVerifyAlert;

  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md md:flex-row flex-col relative"
      )}>
      <SidebarKit />

      <div className="w-full m-0 pb-20 md:ml-[288px]">
        {/* Verification Alert Banner */}
        {showVerificationBanner && (
          <div className="w-full bg-amber-500/90 dark:bg-amber-600/90 text-white px-4 py-2.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <p className="text-sm font-medium">
                Tài khoản chưa được xác minh. Vui lòng kiểm tra email để xác
                minh tài khoản.
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={handleResendVerification}
                disabled={sendingEmail || loading}
                className="text-xs bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {sendingEmail ? "Đang gửi..." : "Gửi lại email"}
              </button>
              <Link
                href="/k/verify"
                className="text-xs bg-white text-amber-600 hover:bg-white/90 px-3 py-1.5 rounded-lg font-medium transition-colors">
                Xác minh ngay
              </Link>
              <button
                onClick={() => setShowVerifyAlert(false)}
                className="p-1 hover:bg-white/20 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80 ">
          <div className="container mx-auto py-1 px-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"></div>

              <div className="flex items-center gap-x-3 justify-between">
                <div className="flex items-center gap-x-2 p-2 rounded-xl cursor-pointer">
                  <div className="text-[12px] text-nowrap font-semibold">
                    {user?.wallet?.balance || 0} Credits
                  </div>
                  <Image src="/coin.png" alt="" width={15} height={15} />
                </div>

                {/* Conditionally render based on screen size - no DOM bloat */}
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
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
