import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ExamRoomStatus = "upcoming" | "active" | "ended";

interface StatusBadgeProps {
  status: ExamRoomStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<
    ExamRoomStatus,
    { label: string; color: string; icon: string }
  > = {
    upcoming: {
      label: "Sắp diễn ra",
      color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      icon: "🔵",
    },
    active: {
      label: "Đang diễn ra",
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      icon: "🟢",
    },
    ended: {
      label: "Đã kết thúc",
      color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
      icon: "⚫",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn("text-xs", config.color, className)}>
      {config.icon}
      {" "}
      {config.label}
    </Badge>
  );
}
