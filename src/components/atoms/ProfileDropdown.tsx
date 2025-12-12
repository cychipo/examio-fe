"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { PersonIcon, CardStackMinusIcon } from "@radix-ui/react-icons";
import { ArrowLeftStartOnRectangleIcon } from "@heroicons/react/24/solid";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Profile {
  name: string;
  email: string;
  avatar: string;
  subscription?: string;
  model?: string;
}

interface MenuItem {
  label: string;
  value?: string;
  href: string;
  icon: React.ReactNode;
  external?: boolean;
}

const SAMPLE_PROFILE_DATA: Profile = {
  name: "Anonymous User",
  email: "user@mail.com",
  avatar: "",
  subscription: "PRO",
};

interface ProfileDropdownProps extends React.HTMLAttributes<HTMLDivElement> {
  data?: Profile;
  showTopbar?: boolean;
}

export default function ProfileDropdown({
  data = SAMPLE_PROFILE_DATA,
  className,
  ...props
}: ProfileDropdownProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const router = useRouter();
  const { logout } = useAuthStore();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const menuItems: MenuItem[] = [
    {
      label: "Hồ sơ",
      href: "/k/profile",
      icon: <PersonIcon className="w-4 h-4" />,
    },
    {
      label: "Subscription",
      value: data.subscription || "Free",
      href: "/k/subscription",
      icon: <CardStackMinusIcon className="w-4 h-4" />,
    },
  ];

  return (
    <div className={cn("relative", className)} {...props}>
      <DropdownMenu onOpenChange={setIsOpen}>
        <div className="group relative">
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-16 focus:outline-none cursor-pointer justify-between">
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight">
                  {data.name}
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400 tracking-tight leading-tight">
                  {data.email}
                </div>
              </div>
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-0.5">
                  <div className="w-full h-full rounded-full overflow-hidden bg-white dark:bg-zinc-900">
                    <img
                      src={data.avatar || "/avt-default.webp"}
                      alt={data.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                </div>
              </div>
            </button>
          </DropdownMenuTrigger>

          {/* Bending line indicator on the right */}
          <div
            className={cn(
              "absolute -right-3 top-1/2 -translate-y-1/2 transition-all duration-200",
              isOpen ? "opacity-100" : "opacity-60 group-hover:opacity-100"
            )}>
            <svg
              width="12"
              height="24"
              viewBox="0 0 12 24"
              fill="none"
              className={cn(
                "transition-all duration-200",
                isOpen
                  ? "text-blue-500 dark:text-blue-400 scale-110"
                  : "text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-600 dark:group-hover:text-zinc-300"
              )}
              aria-hidden="true">
              <path
                d="M2 4C6 8 6 16 2 20"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>

          <DropdownMenuContent
            side="left"
            align="end"
            sideOffset={4}
            className="w-fit p-2 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-sm border border-border/60 dark:border-border/60 rounded-2xl shadow-xl shadow-zinc-900/5 dark:shadow-zinc-950/20
                    data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-top-right z-[1000]">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <DropdownMenuItem
                  key={item.label}
                  asChild
                  className="hover:bg-[#EFF6FF] hover:text-[#2D68FE] rounded-sm focus:bg-[#EFF6FF] focus-visible:bg-[#EFF6FF]">
                  <Link
                    href={item.href}
                    className="flex items-center p-3 transition-all duration-200 cursor-pointer group hover:bg-[#EFF6FF] hover:text-[#2D68FE] rounded-sm focus:outline-none focus-visible:outline-none">
                    <div className="flex items-center gap-2 flex-1">
                      {item.icon}
                      <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight whitespace-nowrap transition-colors">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex-shrink-0 ml-auto">
                      {item.value && (
                        <span
                          className={cn(
                            "text-xs font-medium rounded-md py-1 px-2 tracking-tight",
                            item.label === "Model"
                              ? "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-500/10 border border-blue-500/10"
                              : "text-purple-600 bg-purple-50 dark:text-purple-400 dark:bg-purple-500/10 border border-purple-500/10"
                          )}>
                          {item.value}
                        </span>
                      )}
                    </div>
                  </Link>
                </DropdownMenuItem>
              ))}
            </div>

            <DropdownMenuSeparator className="my-3 bg-gradient-to-r from-transparent via-zinc-200 to-transparent dark:via-zinc-800" />

            <DropdownMenuItem
              asChild
              className="focus:bg-red-500/20 focus-visible:bg-red-500/20 ">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 p-3 duration-200 bg-red-500/10 rounded-sm hover:bg-red-500/20 cursor-pointer transition-all group focus:outline-none focus-visible:outline-none">
                <ArrowLeftStartOnRectangleIcon className="w-4 h-4 text-red-500 group-hover:text-red-600" />
                <span className="text-sm font-medium text-red-500 group-hover:text-red-600">
                  Sign Out
                </span>
              </button>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </div>
      </DropdownMenu>
    </div>
  );
}
