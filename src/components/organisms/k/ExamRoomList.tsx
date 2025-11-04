import { Card } from "@/components/ui/card";
import { ExamRoomCardItem } from "@/components/molecules/ExamRoomCardItem";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter } from "lucide-react";

export interface ExamRoom {
  id: string;
  name: string;
  roomType: string;
  duration: number;
  participants: number;
  timeInfo: string;
  timeLabel: string;
  status: "active" | "upcoming" | "ended";
  isPrivate?: boolean;
}

interface ExamRoomListProps {
  rooms: ExamRoom[];
  filter: string;
  onFilterChange: (value: string) => void;
  onViewRoom: (id: string) => void;
}

export function ExamRoomList({
  rooms,
  filter,
  onFilterChange,
  onViewRoom,
}: ExamRoomListProps) {
  return (
    <Card className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">Phòng thi</h2>
        <Select value={filter} onValueChange={onFilterChange}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả phòng</SelectItem>
            <SelectItem value="active">Đang diễn ra</SelectItem>
            <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
            <SelectItem value="ended">Đã kết thúc</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <ExamRoomCardItem
            key={room.id}
            name={room.name}
            roomType={room.roomType}
            duration={room.duration}
            participants={room.participants}
            timeInfo={room.timeInfo}
            timeLabel={room.timeLabel}
            status={room.status}
            isPrivate={room.isPrivate}
            onViewDetails={() => onViewRoom(room.id)}
          />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">
            Không có phòng thi nào phù hợp
          </p>
        </div>
      )}
    </Card>
  );
}