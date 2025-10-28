import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryIconProps {
  icon: LucideIcon;
  className?: string;
  bgClassName?: string;
}

export function CategoryIcon({
  icon: Icon,
  className,
  bgClassName,
}: CategoryIconProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-lg",
        bgClassName || "bg-primary/10",
        className
      )}>
      <Icon className="h-4 w-4 text-primary" />
    </div>
  );
}
