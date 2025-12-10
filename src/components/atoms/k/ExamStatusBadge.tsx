import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type ExamStatus = "public" | "private" | "draft";

interface ExamStatusBadgeProps {
  status: ExamStatus;
  className?: string;
}

export function ExamStatusBadge({ status, className }: ExamStatusBadgeProps) {
  const statusConfig = {
    public: {
      label: "Public",
      className: "bg-green-500/10 text-green-600 border-green-500/20",
    },
    private: {
      label: "Private",
      className: "bg-orange-500/10 text-orange-600 border-orange-500/20",
    },
    draft: {
      label: "Draft",
      className: "bg-gray-500/10 text-gray-600 border-border/20",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
