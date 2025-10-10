import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  icon?: LucideIcon;
  onClick?: () => void;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  disabled?: boolean;
  variant?: "default" | "purple";
}

export function GradientButton({
  children,
  icon: Icon,
  onClick,
  className,
  size = "default",
  disabled = false,
  variant = "default",
}: GradientButtonProps) {
  const variantStyles = {
    default:
      "bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to hover:opacity-90",
    purple:
      "bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700",
  };

  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      size={size}
      className={cn(variantStyles[variant], className)}
    >
      {Icon && <Icon className="h-4 w-4 mr-2" />}
      {children}
    </Button>
  );
}
