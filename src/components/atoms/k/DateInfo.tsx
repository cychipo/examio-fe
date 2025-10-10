import { Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateInfoProps {
  createdAt: Date | string;
  lastActivity?: Date | string | null;
  activityLabel?: string;
  className?: string;
}

export function DateInfo({
  createdAt,
  lastActivity,
  activityLabel = "Học",
  className,
}: DateInfoProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    return d.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Calendar className="h-3.5 w-3.5" />
        <span>
          Tạo:
          {formatDate(createdAt)}
        </span>
      </div>

      {lastActivity && (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>
            {activityLabel}
            :
            {formatDate(lastActivity)}
          </span>
        </div>
      )}
    </div>
  );
}
