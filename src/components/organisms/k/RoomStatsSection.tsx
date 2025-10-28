import { RoomStatsCard } from "@/components/molecules/RoomStatsCard";
import { Users, TrendingUp, CheckCircle2 } from "lucide-react";

interface RoomStats {
  activeRooms: number;
  totalParticipants: number;
  ongoingExams: number;
  completedToday: number;
}

interface RoomStatsSectionProps {
  stats: RoomStats;
}

export function RoomStatsSection({ stats }: RoomStatsSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <RoomStatsCard
        icon={Users}
        label="Phòng thi đang hoạt động"
        value={stats.activeRooms}
        iconColor="text-blue-500"
        iconBgColor="bg-blue-500/10"
      />
      <RoomStatsCard
        icon={Users}
        label="Tổng số thí sinh"
        value={stats.totalParticipants}
        iconColor="text-purple-500"
        iconBgColor="bg-purple-500/10"
      />
      <RoomStatsCard
        icon={TrendingUp}
        label="Bài thi đang diễn ra"
        value={stats.ongoingExams}
        iconColor="text-orange-500"
        iconBgColor="bg-orange-500/10"
      />
      <RoomStatsCard
        icon={CheckCircle2}
        label="Hoàn thành hôm nay"
        value={stats.completedToday}
        iconColor="text-green-500"
        iconBgColor="bg-green-500/10"
      />
    </div>
  );
}
