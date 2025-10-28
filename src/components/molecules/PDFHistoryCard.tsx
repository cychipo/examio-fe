import { Card, CardContent } from "@/components/ui/card";
import { HistoryItemIcon } from "@/components/atoms/k/HistoryItemIcon";
import { HistoryStatusBadge } from "@/components/atoms/k/HistoryStatusBadge";
import { MoreVertical, Download, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface PDFHistoryItem {
  id: string;
  fileName: string;
  generatedType: "exam" | "flashcard";
  generatedCount: number;
  status: "completed" | "processing" | "failed";
  createdAt: string;
  fileSize: string;
}

interface PDFHistoryCardProps {
  item: PDFHistoryItem;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export function PDFHistoryCard({
  item,
  onDownload,
  onDelete,
}: PDFHistoryCardProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <HistoryItemIcon type="pdf" status={item.status} />

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground truncate">
                  {item.fileName}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Tạo {item.generatedCount}{" "}
                  {item.generatedType === "exam" ? "đề thi" : "flashcard"}
                </p>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => onDownload?.(item.id)}
                    className="cursor-pointer">
                    <Download className="mr-2 h-4 w-4" />
                    Tải xuống
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete?.(item.id)}
                    className="cursor-pointer text-red-600 dark:text-red-400">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              <HistoryStatusBadge status={item.status} />
              <span className="text-xs text-muted-foreground">
                {item.fileSize}
              </span>
              <span className="text-xs text-muted-foreground">
                {item.createdAt}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
