import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface HistoryStatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  iconClassName?: string;
}

export function HistoryStatCard({
  title,
  value,
  icon: Icon,
  iconClassName,
}: HistoryStatCardProps) {
  return (
    <Card className="glass-card">
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              {title}
            </p>
            <h3 className="text-3xl font-bold text-foreground mt-1">{value}</h3>
          </div>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-xl",
              iconClassName || "bg-primary/10 text-primary dark:bg-primary/20"
            )}
          >
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
