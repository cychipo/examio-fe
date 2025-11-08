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
    bgColor: "bg-blue-50", // THÊM MÀU NỀN
    borderColor: "border-l-blue-500", // GIỮ VIỀN TRÁI
    badgeClass: "bg-blue-500/10 text-blue-600",
    label: "Class",
  },
  lab: {
    bgColor: "bg-green-50", // THÊM MÀU NỀN
    borderColor: "border-l-green-500", // GIỮ VIỀN TRÁI
    badgeClass: "bg-green-500/10 text-green-600",
    label: "Lab",
  },
  study: {
    bgColor: "bg-orange-50", // THÊM MÀU NỀN
    borderColor: "border-l-orange-500", // GIỮ VIỀN TRÁI
    badgeClass: "bg-orange-500/10 text-orange-600",
    label: "Study",
  },
  task: {
    bgColor: "bg-purple-50", // THÊM MÀU NỀN
    borderColor: "border-l-purple-500", // GIỮ VIỀN TRÁI
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
        "flex items-start gap-3 rounded-lg border border-border p-3 transition-all hover:shadow-sm",
        config.bgColor, // MÀU NỀN
        config.borderColor, // VIỀN TRÁI MÀU
        "border-l-4", // ĐỘ DÀY VIỀN TRÁI
        className
      )}>
      <div className="min-w-[60px]">
        <p className="text-xs font-medium text-foreground">{time}</p>
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