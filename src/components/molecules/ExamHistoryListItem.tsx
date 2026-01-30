import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { GradeBadge, getGradeFromScore } from "@/components/atoms/k/GradeBadge";

export interface ExamHistoryListItemData {
  id: string;
  examTitle: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  completedAt: string;
  passed: boolean;
}

interface ExamHistoryListItemProps {
  item: ExamHistoryListItemData;
  onClick?: (id: string) => void;
}

export function ExamHistoryListItem({
  item,
  onClick,
}: ExamHistoryListItemProps) {
  const percentage = Math.round((item.correctAnswers / item.totalQuestions) * 100);
  const grade = getGradeFromScore(percentage);

  return (
    <div
      className={cn(
        "flex items-center gap-3 py-3 border-b border-border/50 last:border-b-0",
        onClick && "cursor-pointer hover:bg-muted/30 transition-colors"
      )}
      onClick={() => onClick?.(item.id)}
    >
      {/* Status Icon */}
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        item.passed
          ? "bg-emerald-100"
          : "bg-red-100"
      )}>
        {item.passed ? (
          <Check className="h-4 w-4 text-emerald-600" />
        ) : (
          <X className="h-4 w-4 text-red-600" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground truncate">
          {item.examTitle}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5">
          Điểm: {percentage}% • {item.correctAnswers}/{item.totalQuestions} câu đúng
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {item.completedAt}
        </p>
      </div>

      {/* Grade Badge */}
      <GradeBadge grade={grade} />
    </div>
  );
}
