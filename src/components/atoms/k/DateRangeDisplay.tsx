import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateRangeDisplayProps {
  startDate: Date | string;
  endDate: Date | string;
  className?: string;
  compact?: boolean;
}

export function DateRangeDisplay({
  startDate,
  endDate,
  className,
  compact = false,
}: DateRangeDisplayProps) {
  const formatDate = (date: Date | string) => {
    const d = typeof date === "string" ? new Date(date) : date;
    if (compact) {
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
      });
    }
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      <Calendar className="h-3.5 w-3.5" />
      <span>
        {formatDate(startDate)}
        {" "}
        -
        {formatDate(endDate)}
      </span>
    </div>
  );
}
