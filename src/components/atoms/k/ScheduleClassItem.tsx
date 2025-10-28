import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ScheduleClassItemProps {
  time: string;
  subject: string;
  location: string;
  type: "class" | "lab" | "study" | "task";
  className?: string;
}

const typeConfig = {
  class: {
    color: "border-l-blue-500",
    badgeClass: "bg-blue-500/10 text-blue-600",
    label: "Class",
  },
  lab: {
    color: "border-l-green-500",
    badgeClass: "bg-green-500/10 text-green-600",
    label: "Lab",
  },
  study: {
    color: "border-l-orange-500",
    badgeClass: "bg-orange-500/10 text-orange-600",
    label: "Study",
  },
  task: {
    color: "border-l-purple-500",
    badgeClass: "bg-purple-500/10 text-purple-600",
    label: "Task",
  },
};

export function ScheduleClassItem({
  time,
  subject,
  location,
  type,
  className,
}: ScheduleClassItemProps) {
  const config = typeConfig[type];

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm",
        config.color,
        "border-l-4",
        className
      )}>
      <div className="min-w-[60px]">
        <p className="text-xs font-medium text-muted-foreground">{time}</p>
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-semibold text-foreground">{subject}</h4>
          <Badge
            variant="secondary"
            className={cn("text-xs", config.badgeClass)}>
            {config.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">{location}</p>
      </div>
    </div>
  );
}
