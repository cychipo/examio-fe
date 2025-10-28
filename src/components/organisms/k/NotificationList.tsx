import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  NotificationItem,
  type NotificationItemData,
} from "@/components/molecules/NotificationItem";
import { Button } from "@/components/ui/button";
import { Filter, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NotificationListProps {
  title: string;
  unreadCount: number;
  notifications: NotificationItemData[];
  onMarkAsRead: (id: string) => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
  onMarkAllAsRead?: () => void;
}

export function NotificationList({
  title,
  unreadCount,
  notifications,
  onMarkAsRead,
  onLoadMore,
  hasMore = false,
  totalCount,
  onMarkAllAsRead,
}: NotificationListProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-foreground">
              {title}
            </CardTitle>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} chưa đọc
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Filter className="h-4 w-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onMarkAllAsRead}
                  className="cursor-pointer">
                  Đánh dấu tất cả đã đọc
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  Cài đặt thông báo
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ScrollArea className="h-[calc(100vh-280px)]">
          <div className="space-y-3 pr-3">
            {notifications.length > 0 ? (
              <>
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={onMarkAsRead}
                  />
                ))}

                {/* Load More / Footer */}
                {hasMore && onLoadMore && (
                  <div className="pt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={onLoadMore}
                      className="w-full">
                      Tải thêm thông báo
                    </Button>
                  </div>
                )}

                {totalCount && (
                  <p className="pt-2 text-center text-xs text-muted-foreground">
                    Hiển thị {notifications.length} trong tổng số {totalCount}{" "}
                    thông báo
                  </p>
                )}
              </>
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Không có thông báo nào</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
