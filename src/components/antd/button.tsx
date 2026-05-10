import * as React from "react";
import { Button as AntButton } from "antd";
import type { ButtonProps as AntButtonProps } from "antd";
import { cn } from "@/lib/utils";

type LegacyVariant = "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning" | "info" | "dark" | "light" | "gradient" | "glass" | "error" | "errorGhost";
type LegacySize = "default" | "sm" | "lg" | "icon";
type NativeButtonType = "button" | "submit" | "reset";

export interface ButtonProps extends Omit<AntButtonProps, "size" | "type" | "variant"> {
  variant?: LegacyVariant;
  size?: LegacySize;
  asChild?: boolean;
  type?: NativeButtonType;
}

const variantClasses: Partial<Record<LegacyVariant, string>> = {
  secondary: "!border-transparent !bg-secondary !text-secondary-foreground hover:!bg-secondary/80",
  outline: "!border-border !bg-background !text-foreground hover:!bg-accent hover:!text-accent-foreground",
  ghost: "!border-transparent !bg-transparent !text-foreground !shadow-none hover:!bg-accent hover:!text-accent-foreground",
  link: "!h-auto !border-transparent !bg-transparent !p-0 !text-primary !shadow-none hover:!text-primary/80",
  success: "!border-green-600 !bg-green-600 !text-white hover:!bg-green-700",
  warning: "!border-yellow-500 !bg-yellow-500 !text-white hover:!bg-yellow-600",
  info: "!border-blue-600 !bg-blue-600 !text-white hover:!bg-blue-700",
  dark: "!border-slate-900 !bg-slate-900 !text-white hover:!bg-slate-800",
  light: "!border-border !bg-white !text-foreground hover:!bg-accent",
  gradient: "!border-transparent !bg-gradient-to-r !from-primary !to-red-500 !text-white",
  glass: "!border-white/20 !bg-white/10 !text-foreground !backdrop-blur hover:!bg-white/20",
  errorGhost: "!border-transparent !bg-transparent !text-destructive !shadow-none hover:!bg-destructive/10",
};

function buttonVariants({ variant, size, className }: { variant?: LegacyVariant; size?: LegacySize; className?: string } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-colors [&>svg]:pointer-events-none [&>svg]:size-4 [&>svg]:shrink-0",
    size === "icon" && "!h-10 !w-10 !p-0",
    variantClasses[variant ?? "default"],
    className,
  );
}

const sizeMap: Record<LegacySize, AntButtonProps["size"]> = {
  default: "middle",
  sm: "small",
  lg: "large",
  icon: "middle",
};

function getType(variant?: LegacyVariant): AntButtonProps["type"] {
  if (variant === "ghost" || variant === "errorGhost") return "text";
  if (variant === "link") return "link";
  if (variant === "outline" || variant === "glass" || variant === "light" || variant === "secondary") return "default";
  return "primary";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size = "default", asChild, danger, children, type, htmlType, ...props }, ref) => {
    const classNames = buttonVariants({ variant, size, className });
    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        ...props,
        className: cn(child.props.className, classNames),
        onClick: props.onClick ?? child.props.onClick,
      });
    }

    return (
      <AntButton
        ref={ref as any}
        type={getType(variant)}
        htmlType={htmlType ?? type}
        size={sizeMap[size]}
        danger={danger || variant === "destructive" || variant === "error" || variant === "errorGhost"}
        className={classNames}
        {...props}
      >
        {children}
      </AntButton>
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
