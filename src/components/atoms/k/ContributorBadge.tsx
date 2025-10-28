import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ContributorBadgeProps {
  rank: number;
  className?: string;
}

export function ContributorBadge({ rank, className }: ContributorBadgeProps) {
  if (rank !== 1) return null;

  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-5 w-5 rounded-full border-0 bg-yellow-100 p-0 dark:bg-yellow-900/30",
        className
      )}>
      <Crown className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
    </Badge>
  );
}
