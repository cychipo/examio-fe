import { Card } from "@/components/ui/card";
import { NotificationIcon } from "@/components/atoms/k/NotificationIcon";
import { NotificationTimestamp } from "@/components/atoms/k/NotificationTimestamp";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface NotificationItemData {
  id: string;
  type: "security" | "message" | "payment" | "system" | "team" | "meeting";
  title: string;
  description: string;
  time: string;
  isRead: boolean;
  actions?: {
    primary?: { label: string; onClick: () => void };
    secondary?: { label: string; onClick: () => void };
  };
  avatar?: string;
}

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkAsRead?: (id: string) => void;
}

export function NotificationItem({
  notification,
  onMarkAsRead,
}: NotificationItemProps) {
  const handleClick = () => {
    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }
  };

  return (
    <Card
      className={cn(
        "relative cursor-pointer border-l-4 transition-all hover:shadow-md",
        notification.isRead
          ? "border-l-transparent bg-background"
          : "border-l-primary bg-primary/5"
      )}
      onClick={handleClick}>
      <div className="flex gap-4 p-4">
        {/* Icon or Avatar */}
        {notification.avatar ? (
          <img
            src={notification.avatar}
            alt=""
            className="h-10 w-10 shrink-0 rounded-full object-cover"
          />
        ) : (
          <NotificationIcon type={notification.type} />
        )}

        {/* Content */}
        <div className="flex-1 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-foreground">
              {notification.title}
            </h3>
            <NotificationTimestamp time={notification.time} />
          </div>

          <p className="text-sm text-muted-foreground">
            {notification.description}
          </p>

          {/* Actions */}
          {notification.actions && (
            <div className="flex flex-wrap gap-2 pt-2">
              {notification.actions.primary && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.actions!.primary!.onClick();
                  }}
                  className="h-7 text-xs">
                  {notification.actions.primary.label}
                </Button>
              )}
              {notification.actions.secondary && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    notification.actions!.secondary!.onClick();
                  }}
                  className="h-7 text-xs">
                  {notification.actions.secondary.label}
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="absolute right-4 top-4 h-2 w-2 rounded-full bg-primary" />
        )}
      </div>
    </Card>
  );
}
