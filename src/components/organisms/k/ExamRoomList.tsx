import { Card } from "@/components/ui/card";
import { ExamRoomCardItem } from "@/components/molecules/ExamRoomCardItem";

export interface ExamRoom {
  id: string;
  name: string;
  roomType: string;
  questionCount: number;
  isPrivate?: boolean;
}

export interface ExamRoomListProps {
  rooms: ExamRoom[];
  filter?: string;
  onFilterChange?: (value: string) => void;
  onViewRoom: (id: string) => void;
  onEditRoom?: (id: string) => void;
  onDeleteRoom?: (id: string) => void;
}

export function ExamRoomList({
  rooms,
  filter: _filter,
  onFilterChange: _onFilterChange,
  onViewRoom,
  onEditRoom,
  onDeleteRoom,
}: ExamRoomListProps) {
  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-foreground">
          Danh sách phòng thi
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {rooms.length} phòng thi
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {rooms.map((room) => (
          <ExamRoomCardItem
            key={room.id}
            name={room.name}
            roomType={room.roomType}
            questionCount={room.questionCount}
            isPrivate={room.isPrivate}
            onViewDetails={() => onViewRoom(room.id)}
            onEdit={onEditRoom ? () => onEditRoom(room.id) : undefined}
            onDelete={onDeleteRoom ? () => onDeleteRoom(room.id) : undefined}
          />
        ))}
      </div>

      {rooms.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Chưa có phòng thi nào</p>
        </div>
      )}
    </Card>
  );
}
