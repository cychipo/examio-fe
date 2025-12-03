import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconColor: string;
  iconBgColor: string;
  trend?: number;
  badge?: string;
  className?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  iconColor,
  iconBgColor,
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-border bg-card p-6 shadow-sm",
        className
      )}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("rounded-lg p-2.5", iconBgColor)}>
          <Icon className={cn("h-5 w-5", iconColor)} />
        </div>
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </div>
    </div>
  );
}
