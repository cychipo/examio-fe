import { RoomStatsCard } from "@/components/molecules/RoomStatsCard";
import { DoorOpen, Users } from "lucide-react";
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
    <div className="grid gap-4 grid-cols-2">
      <RoomStatsCard
        icon={DoorOpen}
        label="Phòng thi đang hoạt động"
        value={stats.activeRooms}
        iconColor="text-green-500"
        iconBgColor="bg-green-500/10"
      />
      <RoomStatsCard
        icon={Users}
        label="Tổng số thí sinh"
        value={stats.totalParticipants}
        iconColor="text-primary"
        iconBgColor="bg-primary/10"
      />
    </div>
  );
}
