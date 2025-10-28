import { Card, CardContent } from "@/components/ui/card";
import { HistoryItemIcon } from "@/components/atoms/k/HistoryItemIcon";
import { Clock, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ExamHistoryItem {
  id: string;
  examTitle: string;
  subject: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: string;
  completedAt: string;
  passed: boolean;
}

interface ExamHistoryCardProps {
  item: ExamHistoryItem;
}

export function ExamHistoryCard({ item }: ExamHistoryCardProps) {
  const percentage = (item.correctAnswers / item.totalQuestions) * 100;

  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <HistoryItemIcon
            type="exam"
            status={item.passed ? "completed" : "failed"}
          />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {item.examTitle}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.subject}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Award
                  className={cn(
                    "h-5 w-5",
                    item.passed
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}
                />
                <span
                  className={cn(
                    "text-xl font-bold",
                    item.passed
                      ? "text-green-600 dark:text-green-400"
                      : "text-red-600 dark:text-red-400"
                  )}>
                  {item.score}
                </span>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <Badge
                variant="secondary"
                className={cn(
                  "border-0 font-medium",
                  item.passed
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                {item.passed ? "Đạt" : "Không đạt"}
              </Badge>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <span>
                  {item.correctAnswers}/{item.totalQuestions} câu đúng
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span>{percentage.toFixed(0)}%</span>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{item.timeSpent}</span>
              </div>

              <span className="text-xs text-muted-foreground">
                {item.completedAt}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
