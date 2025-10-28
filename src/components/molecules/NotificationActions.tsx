import { Button } from "@/components/ui/button";
import { Archive, Trash2 } from "lucide-react";

interface NotificationActionsProps {
  onArchiveAll: () => void;
  onDeleteOld: () => void;
}

export function NotificationActions({
  onArchiveAll,
  onDeleteOld,
}: NotificationActionsProps) {
  return (
    <div className="space-y-2 border-t border-border pt-4">
      <p className="px-4 text-xs font-semibold uppercase text-muted-foreground">
        Hành động nhanh
      </p>
      <Button
        variant="ghost"
        onClick={onArchiveAll}
        className="w-full justify-start gap-3 px-4 py-2.5 text-left font-normal text-muted-foreground hover:bg-muted hover:text-foreground">
        <Archive className="h-4 w-4 shrink-0" />
        <span>Lưu trữ đã đọc</span>
      </Button>
      <Button
        variant="ghost"
        onClick={onDeleteOld}
        className="w-full justify-start gap-3 px-4 py-2.5 text-left font-normal text-muted-foreground hover:bg-muted hover:text-foreground">
        <Trash2 className="h-4 w-4 shrink-0" />
        <span>Xóa thông báo cũ</span>
      </Button>
    </div>
  );
}
