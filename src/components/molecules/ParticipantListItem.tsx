import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ParticipantListItemProps {
  name: string;
  subtitle: string;
  status?: "online" | "offline" | "away";
  className?: string;
  avatar?: string;
}

const statusColors = {
  online: "bg-green-500",
  offline: "bg-gray-400",
  away: "bg-yellow-500",
};

export function ParticipantListItem({
  name,
  subtitle,
  status = "offline",
  className,
  avatar,
}: ParticipantListItemProps) {
  return (
    <div className={cn("flex items-center gap-3 py-2", className)}>
      <div className="relative">
        <Avatar className="h-10 w-10">
          {avatar && <AvatarImage src={avatar} alt={name} />}
        </Avatar>
        <span
          className={cn(
            "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
            statusColors[status]
          )}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{name}</p>
        <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}
