import * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/antd/separator";

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div role="list" data-slot="item-group" className={cn("group/item-group flex flex-col", className)} {...props} />;
}

function ItemSeparator({ className, ...props }: React.ComponentProps<typeof Separator>) {
  return <Separator data-slot="item-separator" orientation="horizontal" className={cn("my-0", className)} {...props} />;
}

function Item({ className, variant = "default", size = "default", asChild = false, children, ...props }: React.ComponentProps<"div"> & { variant?: "default" | "outline" | "muted"; size?: "default" | "sm"; asChild?: boolean }) {
  const classes = cn("group/item flex items-center border border-transparent text-sm rounded-md transition-colors flex-wrap outline-none", variant === "outline" && "border-border", variant === "muted" && "bg-muted/50", size === "default" ? "p-4 gap-4" : "py-3 px-4 gap-2.5", className);
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, { className: cn((children as React.ReactElement<any>).props.className, classes) });
  }
  return <div data-slot="item" data-variant={variant} data-size={size} className={classes} {...props}>{children}</div>;
}

function ItemMedia({ className, variant = "default", ...props }: React.ComponentProps<"div"> & { variant?: "default" | "icon" | "image" }) {
  return <div data-slot="item-media" data-variant={variant} className={cn("flex shrink-0 items-center justify-center gap-2", variant === "icon" && "size-8 border rounded-sm bg-muted", variant === "image" && "size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover", className)} {...props} />;
}

function ItemContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-content" className={cn("flex flex-1 flex-col gap-1", className)} {...props} />;
}

function ItemTitle({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-title" className={cn("flex w-fit items-center gap-2 text-sm leading-snug font-medium", className)} {...props} />;
}

function ItemDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="item-description" className={cn("text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance", className)} {...props} />;
}

function ItemActions({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-actions" className={cn("flex items-center gap-2", className)} {...props} />;
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-header" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="item-footer" className={cn("flex basis-full items-center justify-between gap-2", className)} {...props} />;
}

export { Item, ItemMedia, ItemContent, ItemActions, ItemGroup, ItemSeparator, ItemTitle, ItemDescription, ItemHeader, ItemFooter };
