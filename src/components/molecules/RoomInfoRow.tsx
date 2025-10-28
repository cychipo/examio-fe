import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface RoomInfoRowProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  className?: string;
}

export function RoomInfoRow({
  icon: Icon,
  label,
  value,
  iconColor = "text-muted-foreground",
  className,
}: RoomInfoRowProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Icon className={cn("h-4 w-4", iconColor)} />
      <div className="flex items-baseline gap-1">
        <span className="text-sm font-medium text-foreground">{value}</span>
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}
