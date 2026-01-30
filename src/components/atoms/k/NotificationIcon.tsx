import {
  AlertTriangle,
  MessageSquare,
  CheckCircle,
  Wrench,
  UserPlus,
  Calendar,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationIconProps {
  type: "security" | "message" | "payment" | "system" | "team" | "meeting";
  className?: string;
}

const iconMap: Record<string, { icon: LucideIcon; bgClass: string }> = {
  security: {
    icon: AlertTriangle,
    bgClass: "bg-red-100 text-red-600",
  },
  message: {
    icon: MessageSquare,
    bgClass: "bg-red-100 text-primary",
  },
  payment: {
    icon: CheckCircle,
    bgClass:
      "bg-green-100 text-green-600",
  },
  system: {
    icon: Wrench,
    bgClass:
      "bg-yellow-100 text-yellow-600",
  },
  team: {
    icon: UserPlus,
    bgClass:
      "bg-orange-100 text-orange-600",
  },
  meeting: {
    icon: Calendar,
    bgClass:
      "bg-yellow-100 text-yellow-600",
  },
};

export function NotificationIcon({ type, className }: NotificationIconProps) {
  const { icon: Icon, bgClass } = iconMap[type] || iconMap.message;

  return (
    <div
      className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        bgClass,
        className
      )}>
      <Icon className="h-5 w-5" />
    </div>
  );
}
