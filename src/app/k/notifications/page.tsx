"use client";

import { useState, useMemo } from "react";
import { NotificationTemplate } from "@/templates/NotificationTemplate";
import type { NotificationFilter } from "@/components/organisms/k/NotificationFilterSidebar";
import type { NotificationItemData } from "@/components/molecules/NotificationItem";

// Mock notifications data
const mockNotifications: NotificationItemData[] = [
  {
    id: "1",
    type: "security",
    title: "Cảnh báo bảo mật",
    description:
      "Phát hiện hoạt động đăng nhập bất thường từ thiết bị mới ở Hà Nội.",
    time: "2 phút trước",
    isRead: false,
    actions: {
      primary: {
        label: "Xem lại hoạt động",
        onClick: () => console.log("Review activity"),
      },
      secondary: {
        label: "Bỏ qua",
        onClick: () => console.log("Dismiss"),
      },
    },
  },
  {
    id: "2",
    type: "message",
    title: "Tin nhắn mới",
    description: "Sarah Johnson đã gửi cho bạn tin nhắn về đề án dự án.",
    time: "5 phút trước",
    isRead: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    actions: {
      primary: {
        label: "Trả lời",
        onClick: () => console.log("Reply"),
      },
      secondary: {
        label: "Đánh dấu đã đọc",
        onClick: () => console.log("Mark as read"),
      },
    },
  },
  {
    id: "3",
    type: "payment",
    title: "Thanh toán thành công",
    description: "Gói đăng ký của bạn với giá $29.99 đã được xử lý thành công.",
    time: "15 phút trước",
    isRead: false,
    actions: {
      primary: {
        label: "Xem hóa đơn",
        onClick: () => console.log("View receipt"),
      },
      secondary: {
        label: "Lưu trữ",
        onClick: () => console.log("Archive"),
      },
    },
  },
  {
    id: "4",
    type: "system",
    title: "Cập nhật hệ thống",
    description:
      "Bảo trì hệ thống đã hoàn tất. Các tính năng mới hiện đã có sẵn.",
    time: "1 giờ trước",
    isRead: false,
    actions: {
      primary: {
        label: "Xem thay đổi",
        onClick: () => console.log("View changes"),
      },
      secondary: {
        label: "Bỏ qua",
        onClick: () => console.log("Dismiss"),
      },
    },
  },
  {
    id: "5",
    type: "team",
    title: "Lời mời nhóm",
    description:
      "Emily Chen đã mời bạn tham gia không gian làm việc nhóm Marketing.",
    time: "2 giờ trước",
    isRead: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emily",
    actions: {
      primary: {
        label: "Chấp nhận",
        onClick: () => console.log("Accept"),
      },
      secondary: {
        label: "Từ chối",
        onClick: () => console.log("Decline"),
      },
    },
  },
  {
    id: "6",
    type: "meeting",
    title: "Nhắc nhở cuộc họp",
    description: "Cuộc họp standup nhóm bắt đầu trong 30 phút.",
    time: "3 giờ trước",
    isRead: false,
    actions: {
      primary: {
        label: "Tham gia cuộc họp",
        onClick: () => console.log("Join meeting"),
      },
      secondary: {
        label: "Báo ngủ",
        onClick: () => console.log("Snooze"),
      },
    },
  },
  {
    id: "7",
    type: "security",
    title: "Mật khẩu đã thay đổi",
    description: "Mật khẩu tài khoản của bạn đã được cập nhật thành công.",
    time: "5 giờ trước",
    isRead: true,
  },
  {
    id: "8",
    type: "payment",
    title: "Hóa đơn sắp đến hạn",
    description: "Thanh toán đăng ký của bạn sẽ đến hạn trong 3 ngày.",
    time: "1 ngày trước",
    isRead: true,
    actions: {
      primary: {
        label: "Thanh toán ngay",
        onClick: () => console.log("Pay now"),
      },
    },
  },
  {
    id: "9",
    type: "message",
    title: "Đề cập mới",
    description: "John Doe đã nhắc đến bạn trong một bình luận.",
    time: "1 ngày trước",
    isRead: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "10",
    type: "system",
    title: "Sao lưu hoàn tất",
    description: "Quá trình sao lưu dữ liệu định kỳ đã hoàn thành thành công.",
    time: "2 ngày trước",
    isRead: true,
  },
  {
    id: "11",
    type: "team",
    title: "Thành viên mới",
    description: "Alex Wilson đã tham gia vào nhóm của bạn.",
    time: "2 ngày trước",
    isRead: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
  },
  {
    id: "12",
    type: "security",
    title: "Đăng nhập mới",
    description: "Tài khoản của bạn đã được đăng nhập từ Chrome trên Windows.",
    time: "3 ngày trước",
    isRead: true,
  },
  {
    id: "13",
    type: "payment",
    title: "Thanh toán đã hoàn tiền",
    description: "Khoản hoàn tiền $15.00 đã được xử lý vào tài khoản của bạn.",
    time: "1 tuần trước",
    isRead: true,
  },
  {
    id: "14",
    type: "meeting",
    title: "Lịch họp đã hủy",
    description: "Cuộc họp đánh giá dự án đã bị hủy bởi người tổ chức.",
    time: "1 tuần trước",
    isRead: true,
  },
  {
    id: "15",
    type: "system",
    title: "Tính năng mới có sẵn",
    description: "Khám phá các công cụ cộng tác mới trong không gian làm việc.",
    time: "2 tuần trước",
    isRead: true,
  },
];

export default function NotificationsPage() {
  const [activeFilter, setActiveFilter] = useState<NotificationFilter>("all");
  const [notifications, setNotifications] =
    useState<NotificationItemData[]>(mockNotifications);

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    return {
      all: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      account: notifications.filter(
        (n) => n.type === "message" || n.type === "team"
      ).length,
      security: notifications.filter((n) => n.type === "security").length,
      billing: notifications.filter((n) => n.type === "payment").length,
      system: notifications.filter(
        (n) => n.type === "system" || n.type === "meeting"
      ).length,
    };
  }, [notifications]);

  // Filter notifications based on active filter
  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "all":
        return notifications;
      case "unread":
        return notifications.filter((n) => !n.isRead);
      case "account":
        return notifications.filter(
          (n) => n.type === "message" || n.type === "team"
        );
      case "security":
        return notifications.filter((n) => n.type === "security");
      case "billing":
        return notifications.filter((n) => n.type === "payment");
      case "system":
        return notifications.filter(
          (n) => n.type === "system" || n.type === "meeting"
        );
      default:
        return notifications;
    }
  }, [notifications, activeFilter]);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleArchiveAll = () => {
    setNotifications((prev) => prev.filter((n) => !n.isRead));
    console.log("Archived all read notifications");
  };

  const handleDeleteOld = () => {
    // Keep only notifications from the last week
    setNotifications((prev) =>
      prev.filter((n) => {
        // This is a simple mock - in real app, you'd parse the time string
        return !n.time.includes("tuần");
      })
    );
    console.log("Deleted old notifications");
  };

  return (
    <NotificationTemplate
      activeFilter={activeFilter}
      onFilterChange={setActiveFilter}
      filterCounts={filterCounts}
      notifications={filteredNotifications}
      unreadCount={filterCounts.unread}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllAsRead}
      onArchiveAll={handleArchiveAll}
      onDeleteOld={handleDeleteOld}
      hasMore={false}
      totalCount={filteredNotifications.length}
    />
  );
}
