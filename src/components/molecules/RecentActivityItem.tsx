import { Trophy, FileText, BookOpen, Flame, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType = "exam_score" | "pdf_processed" | "flashcard_created" | "study_streak";

export interface RecentActivityItemData {
  id: string;
  type: ActivityType;
  title: string;
  description: string;
  timestamp: string;
}

interface RecentActivityItemProps {
  item: RecentActivityItemData;
}

const activityConfig: Record<ActivityType, { icon: LucideIcon; bg: string; iconColor: string }> = {
  exam_score: {
    icon: Trophy,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
  pdf_processed: {
    icon: FileText,
    bg: "bg-red-100",
    iconColor: "text-primary",
  },
  flashcard_created: {
    icon: BookOpen,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
  study_streak: {
    icon: Flame,
    bg: "bg-yellow-100",
    iconColor: "text-yellow-600",
  },
};

export function RecentActivityItem({ item }: RecentActivityItemProps) {
  const config = activityConfig[item.type];
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0">
      {/* Icon */}
      <div className={cn(
        "flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center",
        config.bg
      )}>
        <Icon className={cn("h-5 w-5", config.iconColor)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">
          <span className="font-semibold">{item.title}</span>
          {" "}
          <span className="text-muted-foreground">{item.description}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {item.timestamp}
        </p>
      </div>
    </div>
  );
}
