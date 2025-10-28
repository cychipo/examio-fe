import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PostTagProps {
  label: string;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

const variantClasses = {
  default: "bg-muted text-muted-foreground hover:bg-muted",
  primary: "bg-primary/10 text-primary hover:bg-primary/20",
  success:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  warning:
    "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
};

export function PostTag({
  label,
  variant = "default",
  className,
}: PostTagProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "border-0 font-medium",
        variantClasses[variant],
        className
      )}>
      {label}
    </Badge>
  );
}
