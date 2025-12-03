"use client";

import { SidebarKit } from "@/components/organisms/k/SideBar";
import { cn } from "@/lib/utils";
import { useAuthSync } from "@/hooks/useAuthSync";
import Image from "next/image";
import { BellIcon, SunIcon, MoonIcon, RocketIcon } from "@radix-ui/react-icons";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Sync token from localStorage to cookie on mount
  useAuthSync();
  const { user } = useAuthStore();
  const { isDarkMode, setTheme } = useThemeContext();
  const isDesktop = useIsDesktop();

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  function handleThemeToggle(checked: boolean) {
    setTheme(checked ? "dark" : "light");
  }
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md md:flex-row flex-col relative"
      )}>
      <SidebarKit />

      <div className="w-full m-0 pb-20 md:ml-[288px]">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80 ">
          <div className="container mx-auto py-1 px-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3"></div>

              <div className="flex items-center gap-x-3 justify-between">
                <div className="flex items-center gap-x-2 p-2 rounded-xl cursor-pointer">
                  <div className="text-[12px] text-nowrap font-semibold">
                    {user?.wallet.balance || 0} Credits
                  </div>
                  <Image src="/coin.png" alt="" width={15} height={15} />
                </div>

                {/* Conditionally render based on screen size - no DOM bloat */}
                {mounted && isDesktop && (
                  <Announcement movingBorder className="cursor-pointer">
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

                <BellIcon className="p-0 hover:bg-transparent cursor-pointer w-4 h-4" />
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
