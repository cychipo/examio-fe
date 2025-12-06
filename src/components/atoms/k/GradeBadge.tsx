import { cn } from "@/lib/utils";

export type GradeType = "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

interface GradeBadgeProps {
  grade: GradeType;
  className?: string;
}

const gradeStyles: Record<GradeType, { bg: string; text: string }> = {
  "A": { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400" },
  "A-": { bg: "bg-emerald-100 dark:bg-emerald-900/40", text: "text-emerald-700 dark:text-emerald-400" },
  "B+": { bg: "bg-blue-100 dark:bg-blue-900/40", text: "text-blue-700 dark:text-blue-400" },
  "B": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400" },
  "B-": { bg: "bg-amber-100 dark:bg-amber-900/40", text: "text-amber-700 dark:text-amber-400" },
  "C+": { bg: "bg-orange-100 dark:bg-orange-900/40", text: "text-orange-700 dark:text-orange-400" },
  "C": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" },
  "C-": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" },
  "D": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" },
  "F": { bg: "bg-red-100 dark:bg-red-900/40", text: "text-red-700 dark:text-red-400" },
};

export function GradeBadge({ grade, className }: GradeBadgeProps) {
  const style = gradeStyles[grade];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg px-3 py-1.5 min-w-[48px]",
        style.bg,
        className
      )}
    >
      <span className={cn("text-lg font-bold leading-tight", style.text)}>
        {grade}
      </span>
      <span className={cn("text-[10px] font-medium leading-tight", style.text)}>
        Điểm
      </span>
    </div>
  );
}

export function getGradeFromScore(score: number, maxScore: number = 100): GradeType {
  const percentage = (score / maxScore) * 100;

  if (percentage >= 93) return "A";
  if (percentage >= 90) return "A-";
  if (percentage >= 87) return "B+";
  if (percentage >= 83) return "B";
  if (percentage >= 80) return "B-";
  if (percentage >= 77) return "C+";
  if (percentage >= 73) return "C";
  if (percentage >= 70) return "C-";
  if (percentage >= 60) return "D";
  return "F";
}
