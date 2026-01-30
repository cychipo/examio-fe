import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface UpcomingExamItemProps {
  subject: string;
  date: string;
  daysLeft: number;
  color?: "red" | "orange" | "blue";
  className?: string;
}

const colorConfig = {
  red: "bg-red-500",
  orange: "bg-orange-500",
  blue: "bg-primary",
};

export function UpcomingExamItem({
  subject,
  date,
  daysLeft,
  color = "blue",
  className,
}: UpcomingExamItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm",
        className
      )}>
      <div className={cn("h-2 w-2 rounded-full", colorConfig[color])} />
      <div className="flex-1 space-y-1">
        <h4 className="font-semibold text-foreground">{subject}</h4>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Calendar className="h-3 w-3" />
          <span>{date}</span>
        </div>
      </div>
      <Badge
        variant="secondary"
        className="bg-muted text-xs font-medium text-foreground">
        {daysLeft} ngày
      </Badge>
    </div>
  );
}
