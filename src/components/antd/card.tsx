import * as React from "react";
import { Card as AntCard } from "antd";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }: React.ComponentProps<"div">) {
  return <AntCard className={cn("overflow-hidden", className)} {...(props as any)}>{children}</AntCard>;
}
function CardHeader({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("px-6 pt-6", className)} {...props} />; }
function CardTitle({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("font-semibold leading-none", className)} {...props} />; }
function CardDescription({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("text-sm text-muted-foreground", className)} {...props} />; }
function CardContent({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("px-6", className)} {...props} />; }
function CardFooter({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("flex items-center px-6 pb-6", className)} {...props} />; }
function CardAction({ className, ...props }: React.ComponentProps<"div">) { return <div className={cn("self-start justify-self-end", className)} {...props} />; }
export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent };
