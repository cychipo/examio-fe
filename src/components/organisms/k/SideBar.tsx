"use client";
import * as React from "react";
import Logo from "@/components/atoms/Logo";
import { ArrowTrendingUpIcon } from "@heroicons/react/24/solid";
import {
  TokensIcon,
  ReaderIcon,
  CardStackIcon,
  RocketIcon,
  ClockIcon,
  CalendarIcon,
  ChatBubbleIcon,
  BellIcon,
  GearIcon,
} from "@radix-ui/react-icons";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useScreenBreakpoint } from "@/hooks/useDevices";
import { FloatingDock } from "@/components/atoms/k/FloatingDock";
import ProfileDropdown from "@/components/atoms/ProfileDropdown";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLayoutEffect, useEffect } from "react";
import { usePathname } from "next/navigation";

interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

export function SidebarKit() {
  const { isMobile } = useScreenBreakpoint();
  const { user, getUser } = useAuthStore();
  const [profile, setProfile] = React.useState<Profile>({
    name: "",
    email: "",
    avatar: "",
  });
  const pathname = usePathname();

  console.log("Pathname in Sidebar:", pathname);

  useLayoutEffect(() => {
    getUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || user.username,
        email: user.email,
        avatar: user.avatar || "",
      });
    }
  }, [user]);

  const itemSiderbar = [
    {
      name: "Ai Tool",
      href: "/k/ai-tool",
      icon: <RocketIcon className="w-5 h-5" />,
      label: "Công cụ AI",
      active: pathname === "/k/ai-tool",
    },
    {
      name: "Manage Exam",
      href: "/k/manage-exam",
      icon: <ReaderIcon className="w-5 h-5" />,
      label: "Quản lý Đề thi",
      active: pathname === "/k/manage-exam",
    },
    {
      name: "Flash Card",
      href: "/k/flash-card",
      icon: <CardStackIcon className="w-5 h-5" />,
      label: "Quản lý Flashcard",
      active: pathname === "/k/flash-card",
    },
    {
      name: "Manage Exam Room",
      href: "/k/manage-exam-room",
      icon: <TokensIcon className="w-5 h-5" />,
      label: "Quản lý Phòng thi",
      active: pathname === "/k/manage-exam-room",
    },
    {
      name: "Schedule",
      href: "/k/schedule",
      icon: <CalendarIcon className="w-5 h-5" />,
      label: "Lịch biểu",
      active: pathname === "/k/schedule",
    },
    {
      name: "Analytics",
      href: "/k/analytics",
      icon: <ArrowTrendingUpIcon className="w-5 h-5" />,
      label: "Phân tích",
      active: pathname === "/k/analytics",
    },
    {
      name: "History",
      href: "/k/history",
      icon: <ClockIcon className="w-5 h-5" />,
      label: "Lịch sử",
      active: pathname === "/k/history",
    },
  ];

  const itemSecondarySiderbar = [
    {
      name: "Messages",
      href: "/k/messages",
      icon: <ChatBubbleIcon className="w-5 h-5" />,
      label: "Tin nhắn",
      active: pathname === "/k/messages",
    },
    {
      name: "Notifications",
      href: "/k/notifications",
      icon: <BellIcon className="w-5 h-5" />,
      label: "Thông báo",
      active: pathname === "/k/notifications",
    },
    {
      name: "Settings",
      href: "/k/settings",
      icon: <GearIcon className="w-5 h-5" />,
      label: "Cài đặt",
      active: pathname === "/k/settings",
    },
  ];

  // Mobile: Show FloatingDock at bottom
  if (isMobile) {
    // Primary items for main dock (5 items)
    const primaryDockItems = itemSiderbar
      .slice(0, 5)
      .map(({ name, href, icon, label, active }) => ({
        name,
        href,
        icon,
        label,
        active,
      }));

    // Secondary items (remaining primary + all secondary)
    const secondaryDockItems = [
      ...itemSiderbar.slice(5).map(({ name, href, icon, label, active }) => ({
        name,
        href,
        icon,
        label,
        active,
      })),
      ...itemSecondarySiderbar.map(({ name, href, icon, label, active }) => ({
        name,
        href,
        icon,
        label,
        active,
      })),
    ];

    return (
      <FloatingDock
        className="z-[1000]"
        items={primaryDockItems}
        secondaryItems={secondaryDockItems}
      />
    );
  }

  // Desktop: Show Sidebar
  return (
    <div className="flex flex-col justify-between gap-y-3 border border-1/2 h-full px-4 pt-4 py-1">
      <div className="flex flex-col gap-y-4 mt-2">
        <Logo sizeLogo={28} sizeText={20} />

        <div className="flex flex-col gap-y-2 mb-2 w-full">
          {itemSiderbar.map((item, index) => (
            <Button
              asChild
              key={index}
              variant="ghost"
              className={`w-full justify-start p-2 hover:bg-[#EFF6FF] hover:text-[#2D68FE] rounded-sm ${
                item.active ? "bg-[#EFF6FF] text-[#2D68FE]" : ""
              }`}>
              <Link href={item.href} className="flex items-center gap-x-3">
                {item.icon}
                {item.label}
              </Link>
            </Button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-y-2 mb-2 w-full">
        {itemSecondarySiderbar.map((item, index) => (
          <Button
            asChild
            key={index}
            variant="ghost"
            className={`w-full justify-start p-2 hover:bg-[#EFF6FF] hover:text-[#2D68FE] rounded-sm ${
              item.active ? "bg-[#EFF6FF] text-[#2D68FE]" : ""
            }`}>
            <Link href={item.href} className="flex items-center gap-x-3">
              {item.icon}
              {item.label}
            </Link>
          </Button>
        ))}
        <div className="mt-2">
          <ProfileDropdown data={profile} />
        </div>
      </div>
    </div>
  );
}
