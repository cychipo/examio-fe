"use client";
import { LogoOnly } from "@/components/atoms/Logo";
import { Bot, BookOpenCheck, SquareSplitVertical, Gem } from "lucide-react";
import Link from "next/link";
import { SeparatorPro } from "@/components/ui/seperatorpro";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function SidebarKit() {
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
      icon: <BookOpenCheck size={20} />,
      label: "QL thi",
    },
  ];

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

      <div className="flex flex-col items-center ">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="p-1 rounded-md cursor-pointer">
              <span className="p-1 rounded-md transition-colors group-hover:bg-accent group-hover:text-accent-foreground">
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
