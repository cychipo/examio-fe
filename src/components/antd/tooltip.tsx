import * as React from "react";
import { Tooltip as AntTooltip } from "antd";
import type { TooltipProps as AntTooltipProps } from "antd";
import { cn } from "@/lib/utils";

function TooltipProvider({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  return <>{children}</>;
}

function getPlacement(side?: string, align?: string): AntTooltipProps["placement"] {
  if (side === "top") return align === "start" ? "topLeft" : align === "end" ? "topRight" : "top";
  if (side === "bottom") return align === "start" ? "bottomLeft" : align === "end" ? "bottomRight" : "bottom";
  if (side === "left") return "left";
  if (side === "right") return "right";
  return "top";
}

function Tooltip({ children }: React.PropsWithChildren<Record<string, unknown>>) {
  const trigger = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === TooltipTrigger,
  ) as React.ReactElement<any> | undefined;
  const content = React.Children.toArray(children).find(
    (child) => React.isValidElement(child) && child.type === TooltipContent,
  ) as React.ReactElement<any> | undefined;
  const triggerChild = trigger?.props.children;

  return (
    <AntTooltip
      title={content?.props.children}
      placement={getPlacement(content?.props.side, content?.props.align)}
      classNames={{ root: content?.props.className }}
    >
      {React.isValidElement(triggerChild) ? triggerChild : <span className="inline-flex">{triggerChild}</span>}
    </AntTooltip>
  );
}

function TooltipTrigger({ children }: React.PropsWithChildren<{ asChild?: boolean }>) {
  return <>{children}</>;
}

function TooltipContent({ children, className }: React.PropsWithChildren<{ side?: string; className?: string; align?: string }>) {
  return <span className={cn("text-xs", className)}>{children}</span>;
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
