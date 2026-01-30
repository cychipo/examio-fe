import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary/90 text-primary-foreground shadow-sm shadow-primary/25 hover:bg-primary",
        secondary:
          "border-border bg-black/10 backdrop-blur-sm text-secondary-foreground hover:bg-black/15",
        destructive:
          "border-transparent bg-destructive/90 text-destructive-foreground shadow-sm shadow-destructive/25 hover:bg-destructive",
        outline:
          "text-foreground border-border bg-black/5 backdrop-blur-sm",
      },
      shiny: {
        true: "relative overflow-hidden",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      shiny: false,
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  shiny?: boolean;
  shinySpeed?: number;
}

function Badge({
  className,
  variant,
  shiny = false,
  shinySpeed = 5,
  children,
  ...props
}: BadgeProps) {
  const animationDuration = `${shinySpeed}s`;

  return (
    <div
      className={cn(badgeVariants({ variant, shiny }), className)}
      {...props}>
      <span className={shiny ? "relative z-10" : ""}>{children}</span>

      {shiny && (
        <span
          className="absolute inset-0 pointer-events-none animate-shine"
          style={{
            background:
              "linear-gradient(120deg, transparent 40%, rgba(255,255,255,0.6) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animationDuration,
            mixBlendMode: "screen",
          }}
        />
      )}

      {shiny && (
        <span
          className="absolute inset-0 pointer-events-none animate-shine hidden"
          style={{
            background:
              "linear-gradient(120deg, transparent 40%, rgba(0,0,150,0.25) 50%, transparent 60%)",
            backgroundSize: "200% 100%",
            animationDuration,
            mixBlendMode: "multiply",
          }}
        />
      )}
    </div>
  );
}

export { Badge, badgeVariants };
