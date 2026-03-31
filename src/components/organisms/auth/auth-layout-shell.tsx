"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, LogOut, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";
import { useAuthSync } from "@/hooks/useAuthSync";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function AuthLayoutShell({ children }: { children: React.ReactNode }) {
  useAuthSync();

  const router = useRouter();
  const { user, isAuthenticated, initializing, getUser, logout } =
    useAuthStore();

  useEffect(() => {
    getUser();
  }, [getUser]);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const dashboardPath =
    user?.role === "teacher" ? "/k/dashboard-teacher" : "/k/dashboard-student";

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-red-50/30 to-yellow-50/30">
      <div className="sticky top-0 z-40 border-b border-red-100/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-red-600 to-yellow-400 text-sm font-bold text-white shadow-lg shadow-red-200/70">
              KMA
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">KMA Edu</p>
              <p className="text-xs text-gray-500">Nền tảng học tập cùng AI</p>
            </div>
          </Link>

          {initializing ? (
            <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
          ) : isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link
                href={dashboardPath}
                className="hidden items-center gap-1 rounded-full border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-primary transition-colors hover:bg-red-100 sm:inline-flex"
              >
                Vào trang chính
                <ChevronRight className="h-4 w-4" />
              </Link>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-3 rounded-full border border-gray-200 bg-white px-2 py-1.5 shadow-sm transition-colors hover:bg-gray-50">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>
                        {user.username?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden text-left sm:block">
                      <p className="max-w-32 truncate text-sm font-semibold text-gray-900">
                        {user.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {user.role === "teacher" ? "Giáo viên" : "Học sinh"}
                      </p>
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Tài khoản</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push("/k/profile")}>
                    <UserIcon className="h-4 w-4" />
                    Hồ sơ
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(dashboardPath)}>
                    <ChevronRight className="h-4 w-4" />
                    Vào trang chính
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="text-sm text-gray-500">Chưa đăng nhập</div>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
