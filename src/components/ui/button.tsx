import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground shadow-lg shadow-destructive/25 hover:bg-destructive/90 hover:shadow-xl hover:shadow-destructive/30",
        outline:
          "border border-border bg-black/5 dark:bg-white/5 backdrop-blur-lg shadow-md hover:bg-black/10 dark:hover:bg-white/10 hover:border-primary/40 dark:hover:border-border",
        secondary:
          "bg-secondary/80 backdrop-blur-sm text-secondary-foreground shadow-sm hover:bg-secondary/90",
        ghost:
          "hover:bg-black/10 dark:hover:bg-white/5 hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        success:
          "bg-green-600 text-white shadow-lg shadow-green-600/25 hover:bg-green-700 hover:shadow-xl",
        warning:
          "bg-yellow-500 text-black shadow-lg shadow-yellow-500/25 hover:bg-yellow-600",
        info: "bg-blue-500 text-white shadow-lg shadow-blue-500/25 hover:bg-blue-600",
        dark: "bg-gray-800/90 backdrop-blur-sm text-white hover:bg-gray-700",
        light: "bg-white/80 backdrop-blur-sm text-gray-800 hover:bg-white/90",
        gradient:
          "bg-gradient-to-r from-primary via-accent to-pink-500 text-white shadow-lg hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5",
        glass:
          "bg-black/5 dark:bg-white/5 backdrop-blur-xl text-foreground border border-border hover:bg-black/10 dark:hover:bg-white/10 hover:border-primary/40 dark:hover:border-border shadow-lg",
        error:
          "bg-red-600 text-white shadow-lg shadow-red-600/25 hover:bg-red-700",
        errorGhost: "hover:bg-red-600/10 text-red-600",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
