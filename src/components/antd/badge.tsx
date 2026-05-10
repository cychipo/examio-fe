import * as React from "react";
import { Tag } from "antd";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";

type BadgeProps = React.ComponentProps<"span"> & {
  variant?: BadgeVariant | string;
};

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary text-primary-foreground",
  secondary: "border-transparent bg-secondary text-secondary-foreground",
  destructive: "border-transparent bg-destructive text-destructive-foreground",
  outline: "border-border bg-transparent text-foreground",
  success: "border-green-200 bg-green-50 text-green-700",
  warning: "border-yellow-200 bg-yellow-50 text-yellow-700",
  info: "border-blue-200 bg-blue-50 text-blue-700",
};

function Badge({ className, variant = "default", children, ...props }: BadgeProps) {
  return (
    <Tag
      className={cn(
        "!m-0 !inline-flex !h-auto !items-center !gap-1 !whitespace-nowrap !rounded-full !border !px-2.5 !py-0.5 !text-xs !font-semibold !leading-5 align-middle transition-colors [&>svg]:pointer-events-none [&>svg]:size-3 [&>svg]:shrink-0",
        variantClasses[variant as BadgeVariant],
        className,
      )}
      {...(props as any)}
    >
      {children}
    </Tag>
  );
}

export { Badge };
