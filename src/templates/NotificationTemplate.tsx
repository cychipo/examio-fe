import {
  NotificationFilterSidebar,
  type NotificationFilter,
} from "@/components/organisms/k/NotificationFilterSidebar";
import { NotificationList } from "@/components/organisms/k/NotificationList";
import type { NotificationItemData } from "@/components/molecules/NotificationItem";

interface NotificationTemplateProps {
  activeFilter: NotificationFilter;
  onFilterChange: (filter: NotificationFilter) => void;
  filterCounts: Record<NotificationFilter, number>;
  notifications: NotificationItemData[];
  unreadCount: number;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onArchiveAll: () => void;
  onDeleteOld: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  totalCount?: number;
}

export function NotificationTemplate({
  activeFilter,
  onFilterChange,
  filterCounts,
  notifications,
  unreadCount,
  onMarkAsRead,
  onMarkAllAsRead,
  onArchiveAll,
  onDeleteOld,
  onLoadMore,
  hasMore,
  totalCount,
}: NotificationTemplateProps) {
  const getTitle = () => {
    switch (activeFilter) {
      case "all":
        return "Thông báo gần đây";
      case "unread":
        return "Thông báo chưa đọc";
      case "account":
        return "Thông báo tài khoản";
      case "security":
        return "Thông báo bảo mật";
      case "billing":
        return "Thông báo thanh toán";
      case "system":
        return "Thông báo hệ thống";
      default:
        return "Thông báo";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thông báo</h1>
        <p className="text-muted-foreground mt-1">
          Quản lý và theo dõi tất cả thông báo của bạn
        </p>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* Sidebar - Hidden on mobile, visible on lg+ */}
        <aside className="hidden lg:block">
          <NotificationFilterSidebar
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            counts={filterCounts}
            onArchiveAll={onArchiveAll}
            onDeleteOld={onDeleteOld}
          />
        </aside>

        {/* Mobile Filter - Visible on mobile, hidden on lg+ */}
        <div className="lg:hidden">
          <NotificationFilterSidebar
            activeFilter={activeFilter}
            onFilterChange={onFilterChange}
            counts={filterCounts}
            onArchiveAll={onArchiveAll}
            onDeleteOld={onDeleteOld}
          />
        </div>

        {/* Notification List */}
        <main>
          <NotificationList
            title={getTitle()}
            unreadCount={unreadCount}
            notifications={notifications}
            onMarkAsRead={onMarkAsRead}
            onMarkAllAsRead={onMarkAllAsRead}
            onLoadMore={onLoadMore}
            hasMore={hasMore}
            totalCount={totalCount}
          />
        </main>
      </div>
    </div>
  );
}
