import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  src?: string;
  alt: string;
  fallback: string;
  online?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizeClasses = {
  sm: "h-8 w-8",
  md: "h-10 w-10",
  lg: "h-12 w-12",
};

export function UserAvatar({
  src,
  alt,
  fallback,
  online,
  size = "md",
  className,
}: UserAvatarProps) {
  return (
    <div className="relative shrink-0">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src} alt={alt} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
          {fallback}
        </AvatarFallback>
      </Avatar>
      {online !== undefined && (
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            online ? "bg-green-500" : "bg-muted-foreground"
          )}
        />
      )}
    </div>
  );
}
