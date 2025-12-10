import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, FileText, HelpCircle, Edit, Trash2 } from "lucide-react";
import { RoomInfoRow } from "./RoomInfoRow";

interface ExamRoomCardItemProps {
  name: string;
  roomType: string;
  questionCount: number;
  onViewDetails?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isPrivate?: boolean;
}

export function ExamRoomCardItem({
  name,
  roomType,
  questionCount,
  isPrivate = false,
  onViewDetails,
  onEdit,
  onDelete,
}: ExamRoomCardItemProps) {
  return (
    <Card className="group relative overflow-hidden p-3 transition-all hover:shadow-sm">
      {/* Header */}
      <div className="mb-2 flex items-center gap-2 min-w-0">
        {isPrivate && (
          <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-blue-500/10">
            <Lock className="h-3.5 w-3.5 text-blue-500" />
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-medium text-foreground text-sm">
            {name}
          </h3>
        </div>
      </div>

      {/* Info rows */}
      <div className="mb-3 flex flex-wrap items-center gap-3 text-xs">
        <RoomInfoRow
          icon={FileText}
          label="Bộ đề"
          value={roomType}
          iconColor="text-blue-500"
        />
        <RoomInfoRow
          icon={HelpCircle}
          label="Câu hỏi"
          value={`${questionCount} câu`}
          iconColor="text-purple-500"
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={onViewDetails}>
          Xem chi tiết
        </Button>
        {onEdit && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0"
            onClick={onEdit}>
            <Edit className="h-3.5 w-3.5" />
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </Card>
  );
}
