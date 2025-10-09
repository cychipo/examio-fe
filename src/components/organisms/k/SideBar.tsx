"use client";
import * as React from "react";
import { LogoOnly } from "@/components/atoms/Logo";
import {
  Bot,
  BookOpenCheck,
  SquareSplitVertical,
  Gem,
  Moon,
  Sun,
  Component,
} from "lucide-react";
import Link from "next/link";
import { SeparatorPro } from "@/components/ui/seperatorpro";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useThemeContext } from "@/provider/theme-provider";
import { useScreenBreakpoint } from "@/hooks/useDevices";
import { FloatingDock } from "@/components/atoms/k/FloatingDock";

export function SidebarKit() {
  const { setTheme, isDarkMode } = useThemeContext();
  const [mounted, setMounted] = React.useState(false);
  const { isMobile } = useScreenBreakpoint();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const itemSiderbar = [
    {
      name: "Ai Tool",
      href: "/k/ai-tool",
      icon: <Bot size={20} />,
      label: "AI",
    },
    {
      name: "Flash Card",
      href: "/k/flash-card",
      icon: <SquareSplitVertical size={20} />,
      label: "Thẻ nhớ",
    },
    {
      name: "Manage Exam",
      href: "/k/manage-exam",
      icon: <BookOpenCheck size={20} />,
      label: "Đề thi",
    },
    {
      name: "Manage Exam Room",
      href: "/k/manage-exam-room",
      icon: <Component size={20} />,
      label: "QL thi",
    },
  ];

  const handleThemeChange = React.useCallback(() => {
    setTheme(isDarkMode ? "light" : "dark");
  }, [isDarkMode, setTheme]);

  // Mobile: Show FloatingDock at bottom
  if (isMobile) {
    const dockItems = [
      ...itemSiderbar.slice(0, 2), // First 2 items
      {
        name: "Theme",
        href: "#",
        icon: !mounted ? (
          <Sun size={20} />
        ) : isDarkMode ? (
          <Sun size={20} />
        ) : (
          <Moon size={20} />
        ),
        label: "Theme",
        onClick: handleThemeChange,
      },
      ...itemSiderbar.slice(2), // Rest items
    ];

    return (
      <FloatingDock
        className="z-[1000]"
        items={dockItems.map((item) => ({
          ...item,
          onClick: item.name === "Theme" ? handleThemeChange : undefined,
        }))}
      />
    );
  }

  // Desktop: Show Sidebar
  return (
    <div className="flex flex-col items-center justify-between gap-y-2 border border-1/2 rounded-lg h-full p-2">
      <div className="flex flex-col items-center ">
        <LogoOnly sizeIcon={30} />
        <SeparatorPro variant="dots" className="w-10" />
        <div className="flex flex-col gap-y-3 h-fit">
          {itemSiderbar.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex flex-col items-center transition-colors p-1 rounded-md group max-w-14">
              <span className="p-1 rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
                {item.icon}
              </span>
              <span className="text-[13px] font-medium text-center text-nowrap">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-3 ">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-1 rounded-md cursor-pointer hover:bg-transparent"
              onClick={handleThemeChange}>
              <span className="p-1 rounded-md transition-colors">
                {!mounted ? (
                  <Sun size={20} className="text-blue-500" />
                ) : isDarkMode ? (
                  <Sun size={20} className="text-blue-500" />
                ) : (
                  <Moon size={20} className="text-blue-500" />
                )}
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {!mounted ? "Chế độ" : isDarkMode ? "Chế độ sáng" : "Chế độ tối"}
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="icon"
              className="p-1 rounded-md cursor-pointer hover:bg-transparent">
              <span className="p-1 rounded-md transition-colors">
                <Gem size={20} className="text-blue-500" />
              </span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>Nâng cấp tài khoản</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}
