"use client";
import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Menu, User, X } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import Logo from "../atoms/Logo";
import { useAuthStore } from "@/stores/useAuthStore";
import { useLayoutEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const menuItems = [
  { name: "Tính năng", href: "/#features" },
  // FREE_MODE: Ẩn menu Bảng giá - uncomment để bật lại
  // { name: "Bảng giá", href: "/#pricing" },
  { name: "Giới thiệu", href: "/about" },
  { name: "Liên hệ", href: "/contact" },
];

export default function HeaderSection() {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);
  const router = useRouter();
  const { user, isAuthenticated, initializing, getUser, logout } =
    useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  useLayoutEffect(() => {
    getUser();
  }, [getUser]);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <header>
      <nav
        data-state={menuState && "active"}
        className="fixed z-20 w-full px-2 group"
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-5",
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0 lg:py-2.5">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                href="/"
                aria-label="home"
                className="flex items-center space-x-2"
              >
                <Logo />
              </Link>

              <button
                onClick={() => setMenuState(!menuState)}
                aria-label={menuState === true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
              >
                <Menu className="in-data-[state=active]:rotate-180 group-data-[state=active]:scale-0 group-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                <X className="group-data-[state=active]:rotate-0 group-data-[state=active]:scale-100 group-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item, index) => (
                  <li key={index}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>{item.name}</span>
                    </Link>
                  </li>
                ))}
                {isAuthenticated && (
                  <li>
                    <Link
                      href="/k"
                      className="text-muted-foreground hover:text-accent-foreground block duration-150"
                    >
                      <span>Công cụ</span>
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            <div className="bg-background group-data-[state=active]:block lg:group-data-[state=active]:flex mb-6 hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item, index) => (
                    <li key={index}>
                      <Link
                        href={item.href}
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                  {isAuthenticated && (
                    <li>
                      <Link
                        href="/k"
                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                      >
                        <span>Công cụ</span>
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
              {initializing ? (
                // Show skeleton/placeholder while checking auth status
                <div className="flex w-full justify-end md:w-fit">
                  <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
                </div>
              ) : !isAuthenticated ? (
                <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-3 sm:space-y-0 md:w-fit">
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className={cn(isScrolled && "lg:hidden")}
                  >
                    <Link href="/login">
                      <span>Đăng nhập</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      isScrolled && "lg:hidden",
                      "bg-primary hover:bg-red-700 text-white",
                    )}
                  >
                    <Link href="/register">
                      <span>Đăng ký</span>
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="sm"
                    className={cn(
                      isScrolled ? "lg:inline-flex" : "hidden",
                      "bg-primary hover:bg-red-700 text-white",
                    )}
                  >
                    <Link href="/login">
                      <span>Bắt đầu ngay</span>
                    </Link>
                  </Button>
                </div>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>
                        {user?.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-fit" align="center">
                    <DropdownMenuLabel className="font-semibold">
                      Tài khoản
                    </DropdownMenuLabel>
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => router.push("/k/profile")}
                      >
                        <User className="h-4 w-4" />
                        Hồ sơ
                      </DropdownMenuItem>
                      {/* FREE_MODE: Ẩn menu Thanh toán - uncomment để bật lại
                      <DropdownMenuItem
                        onClick={() => router.push("/k/subscription")}
                      >
                        <CreditCard className="h-4 w-4" />
                        Thanh toán
                      </DropdownMenuItem>
                      */}
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
