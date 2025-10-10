import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type DifficultyLevel
  = | "beginner"
    | "intermediate"
    | "advanced"
    | "Dễ"
    | "Trung bình"
    | "Khó";

interface DifficultyBadgeProps {
  difficulty: DifficultyLevel;
  className?: string;
}

export function DifficultyBadge({
  difficulty,
  className,
}: DifficultyBadgeProps) {
  const difficultyConfig: Record<
    DifficultyLevel,
    { color: string; label: string; icon: string }
  > = {
    beginner: {
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "Cơ bản",
      icon: "🟢",
    },
    Dễ: {
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "Dễ",
      icon: "🟢",
    },
    intermediate: {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Trung bình",
      icon: "🟡",
    },
    "Trung bình": {
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Trung bình",
      icon: "🟡",
    },
    advanced: {
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      label: "Nâng cao",
      icon: "🔴",
    },
    Khó: {
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      label: "Khó",
      icon: "🔴",
    },
  };

  const config = difficultyConfig[difficulty];

  return (
    <Badge variant="outline" className={cn("text-xs", config.color, className)}>
      {config.icon}
      {" "}
      {config.label}
    </Badge>
  );
}
