import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface CardIconProps {
  icon: LucideIcon;
  className?: string;
  variant?: "gradient" | "primary" | "purple" | "custom";
}

export function CardIcon({
  icon: Icon,
  className,
  variant = "gradient",
}: CardIconProps) {
  const variantStyles = {
    gradient: "bg-gradient-to-br from-gradient-from/20 to-gradient-to/20",
    primary: "bg-gradient-to-br from-primary/20 to-purple-500/20",
    purple: "bg-gradient-to-br from-purple-500/20 to-pink-500/20",
    custom: "",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl p-3",
        variantStyles[variant],
        className,
      )}
    >
      <Icon className="h-6 w-6 text-primary" />
    </div>
  );
}
