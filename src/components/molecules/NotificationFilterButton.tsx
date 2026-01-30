import { Button } from "@/components/ui/button";
import { NotificationBadge } from "@/components/atoms/k/NotificationBadge";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NotificationFilterButtonProps {
  icon: LucideIcon;
  label: string;
  count: number;
  isActive: boolean;
  onClick: () => void;
}

export function NotificationFilterButton({
  icon: Icon,
  label,
  count,
  isActive,
  onClick,
}: NotificationFilterButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      className={cn(
        "w-full justify-start gap-3 px-4 py-2.5 text-left font-normal",
        isActive
          ? "bg-primary/10 text-primary"
          : "text-muted-foreground hover:bg-muted hover:text-foreground"
      )}>
      <Icon className="h-4 w-4 shrink-0" />
      <span className="flex-1">{label}</span>
      <NotificationBadge count={count} />
    </Button>
  );
}
