import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreVertical, Eye, Edit, Pin, Trash2 } from "lucide-react";

interface CardActionsMenuProps {
  isPinned?: boolean;
  onView?: () => void;
  onEdit?: () => void;
  onPin?: () => void;
  onDelete?: () => void;
  viewLabel?: string;
  className?: string;
}

export function CardActionsMenu({
  isPinned = false,
  onView,
  onEdit,
  onPin,
  onDelete,
  viewLabel = "Xem chi tiết",
  className,
}: CardActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className || "h-8 w-8 hover:bg-primary/10"}
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {onView && (
          <DropdownMenuItem onClick={onView}>
            <Eye className="mr-2 h-4 w-4" />
            {viewLabel}
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit}>
            <Edit className="mr-2 h-4 w-4" />
            Chỉnh sửa
          </DropdownMenuItem>
        )}
        {onPin && (
          <DropdownMenuItem onClick={onPin}>
            <Pin className="mr-2 h-4 w-4" />
            {isPinned ? "Bỏ ghim" : "Ghim"}
          </DropdownMenuItem>
        )}
        {onDelete && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Xóa
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
