import * as React from "react";
import { Avatar as AntAvatar } from "antd";
import { cn } from "@/lib/utils";
function Avatar({ className, children, ...props }: any) { return <AntAvatar className={className} {...props}>{children}</AntAvatar>; }
function AvatarImage({ src, alt }: { src?: string; alt?: string }) { return src ? <img src={src} alt={alt || ""} /> : null; }
function AvatarFallback({ className, ...props }: React.ComponentProps<"span">) { return <span className={cn("flex h-full w-full items-center justify-center", className)} {...props} />; }
export { Avatar, AvatarImage, AvatarFallback };
