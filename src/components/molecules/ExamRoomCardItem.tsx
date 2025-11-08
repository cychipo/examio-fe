import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Lock, Users, Clock, Edit, Trash2 } from "lucide-react";
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
  onEdit?: () => void;
  onDelete?: () => void;
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
  onEdit,
  onDelete,
}: ExamRoomCardItemProps) {
  const config = statusConfig[status];

  return (
    <Card className="group relative overflow-hidden p-3 transition-all hover:shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {isPrivate && (
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/10">
              <Lock className="h-3.5 w-3.5 text-blue-500" />
            </div>
          )}
          <div className="min-w-0">
            <h3 className="truncate font-medium text-foreground text-sm">{name}</h3>
            <p className="text-xs text-muted-foreground">{roomType}</p>
          </div>
        </div>
        <Badge variant="secondary" className={`text-[11px] ${config.badgeClass}`}>
          {config.badge}
        </Badge>
      </div>

      {/* Info rows */}
      <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
        <RoomInfoRow
          icon={Clock}
          label="Thời lượng"
          value={`${duration}m`}
          iconColor="text-blue-500"
        />
        <RoomInfoRow
          icon={Users}
          label="Thí sinh"
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

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={onViewDetails}
        >
          Xem chi tiết
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}
          >
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
