import * as React from "react";
import { Dropdown } from "antd";
import type { MenuProps } from "antd";
import { cn } from "@/lib/utils";

type MenuItem = Required<MenuProps>["items"][number];

type DropdownMenuProps = React.PropsWithChildren<{
  onOpenChange?: (open: boolean) => void;
}>;

type DropdownMenuContentProps = React.PropsWithChildren<{
  side?: string;
  align?: string;
  sideOffset?: number;
  className?: string;
}>;

type DropdownMenuItemProps = React.ComponentProps<"div"> & {
  inset?: boolean;
  variant?: "default" | "destructive";
  asChild?: boolean;
};

function collectMenuItems(children: React.ReactNode): MenuItem[] {
  const items: MenuItem[] = [];
  React.Children.forEach(children, (child, index) => {
    if (!React.isValidElement(child)) return;
    const element = child as React.ReactElement<any>;
    if (element.type === DropdownMenuItem) {
      items.push({
        key: element.props.key ?? String(index),
        label: <span className={cn("flex w-max max-w-[min(80vw,28rem)] items-center gap-2 whitespace-nowrap", element.props.className)}>{element.props.children}</span>,
        disabled: element.props.disabled,
        danger: element.props.variant === "destructive",
        onClick: element.props.onClick,
      });
      return;
    }
    if (element.type === DropdownMenuSeparator) {
      items.push({ type: "divider" });
      return;
    }
    if (element.type === DropdownMenuLabel) {
      items.push({ key: `label-${index}`, label: <span className={cn("text-muted-foreground text-xs", element.props.className)}>{element.props.children}</span>, disabled: true });
      return;
    }
    items.push(...collectMenuItems(element.props.children));
  });
  return items;
}

function getPlacement(content?: React.ReactElement<any>): MenuProps extends never ? never : "bottomLeft" | "bottomRight" | "topLeft" | "topRight" {
  const side = content?.props.side ?? "bottom";
  const align = content?.props.align ?? "start";
  if (side === "top") return align === "end" ? "topRight" : "topLeft";
  return align === "end" ? "bottomRight" : "bottomLeft";
}

function DropdownMenu({ children, onOpenChange }: DropdownMenuProps) {
  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenuTrigger,
  ) as React.ReactElement<any> | undefined;
  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === DropdownMenuContent,
  ) as React.ReactElement<any> | undefined;
  const items = collectMenuItems(content?.props.children);
  const triggerChild = trigger?.props.children;

  return (
    <Dropdown
      menu={{ items }}
      trigger={["click"]}
      onOpenChange={onOpenChange}
      placement={getPlacement(content)}
      classNames={{ root: cn(content?.props.className, "!w-max min-w-max max-w-[min(90vw,32rem)]") }}
    >
      {React.isValidElement(triggerChild) ? triggerChild : <span className="inline-flex">{triggerChild}</span>}
    </Dropdown>
  );
}

function DropdownMenuPortal({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuTrigger({ children }: React.PropsWithChildren<{ asChild?: boolean }>) {
  return <>{children}</>;
}

function DropdownMenuContent({ children }: DropdownMenuContentProps) {
  return <>{children}</>;
}

function DropdownMenuGroup({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuItem({ className, inset, variant = "default", asChild, children, ...props }: DropdownMenuItemProps) {
  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      className: cn((children as React.ReactElement<any>).props.className, className),
    });
  }
  return <div data-inset={inset} data-variant={variant} className={className} {...props}>{children}</div>;
}

function DropdownMenuCheckboxItem({ children }: React.PropsWithChildren<{ checked?: boolean }>) {
  return <>{children}</>;
}

function DropdownMenuRadioGroup({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuRadioItem({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuLabel({ className, inset, ...props }: React.ComponentProps<"div"> & { inset?: boolean }) {
  return <div data-inset={inset} className={className} {...props} />;
}

function DropdownMenuSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("bg-border -mx-1 my-1 h-px", className)} {...props} />;
}

function DropdownMenuShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span className={cn("text-muted-foreground ml-auto text-xs tracking-widest", className)} {...props} />;
}

function DropdownMenuSub({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuSubTrigger({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

function DropdownMenuSubContent({ children }: React.PropsWithChildren) {
  return <>{children}</>;
}

export { DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent };
