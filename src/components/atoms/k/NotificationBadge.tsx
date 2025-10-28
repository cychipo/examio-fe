import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface NotificationBadgeProps {
  count: number;
  className?: string;
}

export function NotificationBadge({
  count,
  className,
}: NotificationBadgeProps) {
  if (count === 0) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground",
        className
      )}>
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
