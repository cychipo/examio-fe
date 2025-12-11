import { FileText, Loader2, Check, MoreVertical, Download, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface PDFHistoryListItemData {
  id: string;
  fileName: string;
  description: string;
  status: "completed" | "processing" | "failed";
  createdAt: string;
}

interface PDFHistoryListItemProps {
  item: PDFHistoryListItemData;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const statusConfig = {
  completed: {
    label: "Hoàn thành",
    icon: Check,
    className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 hover:bg-emerald-100",
  },
  processing: {
    label: "Đang xử lý",
    icon: Loader2,
    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400 hover:bg-amber-100",
  },
  failed: {
    label: "Thất bại",
    icon: FileText,
    className: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400 hover:bg-red-100",
  },
};

export function PDFHistoryListItem({
  item,
  onDownload,
  onDelete,
}: PDFHistoryListItemProps) {
  const config = statusConfig[item.status];
  const StatusIcon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 border-b border-border/50 last:border-b-0">
      {/* PDF Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
        <FileText className="h-5 w-5 text-amber-600 dark:text-amber-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-foreground truncate">
          {item.fileName}
        </h4>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">
          {item.description}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {item.createdAt}
        </p>
      </div>

      {/* Status Badge */}
      <Badge
        variant="secondary"
        className={cn("flex items-center gap-1 border-0 text-xs", config.className)}
      >
        <div className="flex items-center gap-1">
          <StatusIcon className={cn("h-3 w-3", item.status === "processing" && "animate-spin")} />
          {config.label}
        </div>
      </Badge>

      {/* Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => onDownload?.(item.id)}
            className="cursor-pointer"
          >
            <Download className="mr-2 h-4 w-4" />
            Tải xuống
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onDelete?.(item.id)}
            className="cursor-pointer text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Xóa
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
