import * as React from "react";
import { cn } from "@/lib/utils";
function ScrollArea({ className, children, ...props }: React.ComponentProps<"div">) { return <div className={cn("overflow-auto", className)} {...props}>{children}</div>; }
function ScrollBar(props: React.ComponentProps<"div">) { return <div {...props} />; }
export { ScrollArea, ScrollBar };
