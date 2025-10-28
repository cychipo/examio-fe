import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConnectionStatusProps {
  status: "connected" | "connecting" | "disconnected";
  className?: string;
}

const statusConfig = {
  connected: {
    label: "Đã kết nối",
    className:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  },
  connecting: {
    label: "Đang kết nối",
    className:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  disconnected: {
    label: "Mất kết nối",
    className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  },
};

export function ConnectionStatus({ status, className }: ConnectionStatusProps) {
  const config = statusConfig[status];

  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", config.className, className)}>
      {config.label}
    </Badge>
  );
}
