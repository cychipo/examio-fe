import { Card } from "@/components/ui/card";
import { UserAvatar } from "@/components/atoms/k/UserAvatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Conversation {
  id: string;
  userName: string;
  userAvatar?: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  isOnline: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export function ConversationItem({
  conversation,
  isActive,
  onClick,
}: ConversationItemProps) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "cursor-pointer border-l-4 p-3 transition-all hover:shadow-md",
        isActive
          ? "border-l-primary bg-primary/5"
          : "border-l-transparent hover:bg-muted"
      )}>
      <div className="flex items-start gap-3">
        <UserAvatar
          src={conversation.userAvatar}
          alt={conversation.userName}
          fallback={conversation.userName.slice(0, 2).toUpperCase()}
          online={conversation.isOnline}
          size="md"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground truncate">
              {conversation.userName}
            </h3>
            <span className="text-xs text-muted-foreground shrink-0">
              {conversation.timestamp}
            </span>
          </div>

          <p className="text-sm text-muted-foreground truncate mt-1">
            {conversation.lastMessage}
          </p>
        </div>

        {conversation.unreadCount && conversation.unreadCount > 0 && (
          <Badge className="h-5 min-w-5 rounded-full bg-primary px-1.5 text-xs">
            {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
          </Badge>
        )}
      </div>
    </Card>
  );
}
