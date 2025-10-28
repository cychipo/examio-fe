import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomIconProps {
  icon: LucideIcon;
  className?: string;
  variant?: "primary" | "success" | "warning" | "danger";
}

const variantStyles = {
  primary: "bg-blue-500/10 text-blue-500",
  success: "bg-green-500/10 text-green-500",
  warning: "bg-yellow-500/10 text-yellow-500",
  danger: "bg-red-500/10 text-red-500",
};

export function RoomIcon({
  icon: Icon,
  className,
  variant = "primary",
}: RoomIconProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg",
        variantStyles[variant],
        className
      )}>
      <Icon className="h-5 w-5" />
    </div>
  );
}
