import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, Clock } from "lucide-react";
import { RoomInfoRow } from "./RoomInfoRow";

interface ExamRoomCardItemProps {
  name: string;
  roomType: string;
  duration: number;
  participants: number;
  timeInfo: string;
  timeLabel: string;
  status: "active" | "upcoming" | "ended";
  isPrivate?: boolean;
  onViewDetails?: () => void;
}

const statusConfig = {
  active: {
    badge: "Đang diễn ra",
    badgeClass: "bg-green-500/10 text-green-600",
    timeColor: "text-red-500",
  },
  upcoming: {
    badge: "Sắp diễn ra",
    badgeClass: "bg-yellow-500/10 text-yellow-600",
    timeColor: "text-blue-500",
  },
  ended: {
    badge: "Đã kết thúc",
    badgeClass: "bg-gray-500/10 text-gray-600",
    timeColor: "text-muted-foreground",
  },
};

export function ExamRoomCardItem({
  name,
  roomType,
  duration,
  participants,
  timeInfo,
  timeLabel,
  status,
  isPrivate = false,
  onViewDetails,
}: ExamRoomCardItemProps) {
  const config = statusConfig[status];

  return (
    <Card className="group relative overflow-hidden p-4 transition-all hover:shadow-md">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex items-center gap-2">
            {isPrivate && (
              <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-blue-500/10">
                <Lock className="h-4 w-4 text-blue-500" />
              </div>
            )}
            <h3 className="truncate font-semibold text-foreground">{name}</h3>
          </div>
          <p className="text-sm text-muted-foreground">{roomType}</p>
        </div>
        <Badge variant="secondary" className={config.badgeClass}>
          {config.badge}
        </Badge>
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <RoomInfoRow
          icon={Clock}
          label="Duration"
          value={`${duration}m`}
          iconColor="text-blue-500"
        />
        <RoomInfoRow
          icon={Users}
          label="Participants"
          value={participants}
          iconColor="text-purple-500"
        />
        <RoomInfoRow
          icon={Clock}
          label={timeLabel}
          value={timeInfo}
          iconColor={config.timeColor}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={onViewDetails}>
        Xem chi tiết
      </Button>
    </Card>
  );
}
