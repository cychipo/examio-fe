import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatItemProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  iconColor?: string;
  className?: string;
}

export function StatItem({
  icon: Icon,
  label,
  value,
  iconColor = "blue-500",
  className,
}: StatItemProps) {
  return (
    <div className={cn("flex items-center gap-2 text-sm", className)}>
      <div className={cn("p-1.5 rounded", `bg-${iconColor}/10`)}>
        <Icon className={cn("h-3.5 w-3.5", `text-${iconColor}`)} />
      </div>
      <div>
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="font-semibold">{value}</div>
      </div>
    </div>
  );
}
