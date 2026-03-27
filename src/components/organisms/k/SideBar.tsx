"use client";
import * as React from "react";
import Logo from "@/components/atoms/Logo";
import {
  TokensIcon,
  ReaderIcon,
  CardStackIcon,
  RocketIcon,
  ClockIcon,
  DashboardIcon,
} from "@radix-ui/react-icons";
import { Bot, BookOpen, GraduationCap, Library } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FloatingDock } from "@/components/atoms/k/FloatingDock";
import ProfileDropdown from "@/components/atoms/ProfileDropdown";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLayoutEffect, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import { canAccessGenAIKnowledgeManager } from "@/lib/genai-knowledge-access";

interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

export function SidebarKit() {
  const { user, getUser } = useAuthStore();
  const [profile, setProfile] = React.useState<Profile>({
    name: "",
    email: "",
    avatar: "",
  });
  const pathname = usePathname();
  const isDesktop = useIsDesktop();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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
      name: "Dashboard",
      href: "/k/dashboard-teacher",
      icon: <DashboardIcon className="w-5 h-5" />,
      label: "Dashboard",
      active: pathname === "/k/dashboard-teacher",
      teacherOnly: true,
    },
    {
      name: "Dashboard Student",
      href: "/k/dashboard-student",
      icon: <DashboardIcon className="w-5 h-5" />,
      label: "Dashboard",
      active: pathname === "/k/dashboard-student",
      studentOnly: true,
    },
    {
      name: "Ai Tool",
      href: "/k/ai-tool",
      icon: <RocketIcon className="w-5 h-5" />,
      label: "Công cụ AI",
      active: pathname === "/k/ai-tool",
      teacherOnly: true, // Add teacher-only flag
    },
    {
      name: "GenAI Knowledge",
      href: "/k/genai-knowledge",
      icon: <Library className="w-5 h-5" />,
      label: "Kho tri thức GenAI",
      active: pathname === "/k/genai-knowledge",
      teacherOnly: true,
      allowlistedTeacherOnly: true,
    },
    {
      name: "AI Teacher",
      href: "/k/ai-teacher",
      icon: <Bot />,
      label: "Giáo viên AI",
      active: pathname === "/k/ai-teacher",
      studentOnly: true, // Only students can access
    },
    {
      name: "My Materials",
      href: "/k/my-materials",
      icon: <BookOpen className="w-5 h-5" />,
      label: "Tài liệu của tôi",
      active: pathname === "/k/my-materials",
      studentOnly: true,
    },
    {
      name: "My Exams",
      href: "/k/my-exams",
      icon: <GraduationCap className="w-5 h-5" />,
      label: "Bài thi của tôi",
      active: pathname === "/k/my-exams",
      studentOnly: true,
    },
    {
      name: "Manage Exam",
      href: "/k/manage-exam",
      icon: <ReaderIcon className="w-5 h-5" />,
      label: "Quản lý Đề thi",
      active:
        pathname === "/k/manage-exam" ||
        pathname.startsWith("/k/manage-quiz-set") ||
        pathname.startsWith("/k/practice-quiz"),
      teacherOnly: true, // Add teacher-only flag
    },
    {
      name: "Flash Card",
      href: "/k/flash-card",
      icon: <CardStackIcon className="w-5 h-5" />,
      label: "Quản lý Flashcard",
      active:
        pathname === "/k/flash-card" ||
        pathname.startsWith("/k/manage-flashcard-set"),
      teacherOnly: true, // Add teacher-only flag
    },
    {
      name: "Manage Exam Room",
      href: "/k/manage-exam-room",
      icon: <TokensIcon className="w-5 h-5" />,
      label: "Quản lý Phòng thi",
      active:
        pathname === "/k/manage-exam-room" ||
        pathname.startsWith("/k/manage-exam-room"),
      teacherOnly: true, // Add teacher-only flag
    },
    {
      name: "History",
      href: "/k/history",
      icon: <ClockIcon className="w-5 h-5" />,
      label: "Lịch sử",
      active: pathname === "/k/history",
    },
  ];

  // Filter sidebar items based on user role
  const filteredSidebarItems = itemSiderbar.filter((item) => {
    // Hide teacher-only items for anyone who is not a teacher (including admin and student)
    if (item.teacherOnly) {
      if (item.allowlistedTeacherOnly) {
        return canAccessGenAIKnowledgeManager(user);
      }

      return user?.role === "teacher";
    }
    // Hide student-only items for anyone who is not a student
    if (item.studentOnly) {
      return user?.role === "student";
    }
    return true;
  });

  // For mobile FloatingDock
  const primaryDockItems = filteredSidebarItems
    .slice(0, 5)
    .map(({ name, href, icon, label, active }) => ({
      name,
      href,
      icon,
      label,
      active,
    }));

  const secondaryDockItems = [
    ...filteredSidebarItems
      .slice(5)
      .map(({ name, href, icon, label, active }) => ({
        name,
        href,
        icon,
        label,
        active,
      })),
  ];

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <>
      {/* Mobile: FloatingDock - Only render on mobile */}
      {!isDesktop && (
        <FloatingDock
          className="z-[1000]"
          items={primaryDockItems}
          secondaryItems={secondaryDockItems}
        />
      )}

      {/* Desktop: Sidebar - Only render on desktop */}
      {isDesktop && (
        <div className="fixed bg-background h-[calc(100%)] w-[250px] flex flex-col justify-between gap-y-3 border border-1/2 px-4 pt-4 py-1">
          <div className="flex flex-col gap-y-4 mt-2">
            <Logo sizeLogo={28} sizeText={20} />

            <div className="flex flex-col gap-y-2 mb-2 w-full">
              {filteredSidebarItems.map((item, index) => (
                <Button
                  asChild
                  key={index}
                  variant="ghost"
                  className={`w-full justify-start p-2 hover:bg-[#fef2f2] hover:text-[#e31837]
                     rounded-sm ${
                       item.active ? "bg-[#fef2f2] text-[#e31837]" : ""
                     }`}
                >
                  <Link href={item.href} className="flex items-center gap-x-3">
                    {item.icon}
                    {item.label}
                  </Link>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-y-2 mb-2 w-full">
            <div className="mt-2">
              <ProfileDropdown data={profile} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
