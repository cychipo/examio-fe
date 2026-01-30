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
      "bg-green-100 text-green-700",
  },
  connecting: {
    label: "Đang kết nối",
    className:
      "bg-yellow-100 text-yellow-700",
  },
  disconnected: {
    label: "Mất kết nối",
    className: "bg-red-100 text-red-700",
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
