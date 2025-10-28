import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface HistoryStatusBadgeProps {
  status: "completed" | "processing" | "failed";
  className?: string;
}

export function HistoryStatusBadge({
  status,
  className,
}: HistoryStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          label: "Hoàn thành",
          className:
            "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
        };
      case "processing":
        return {
          label: "Đang xử lý",
          className:
            "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
        };
      case "failed":
        return {
          label: "Thất bại",
          className:
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
        };
      default:
        return {
          label: "Không xác định",
          className: "bg-muted text-muted-foreground",
        };
    }
  };

  const config = getStatusConfig();

  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
