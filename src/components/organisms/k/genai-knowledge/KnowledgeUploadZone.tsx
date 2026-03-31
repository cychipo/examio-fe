import { UploadCloud } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface KnowledgeUploadZoneProps {
  selectedFolderName?: string;
  selectedFolderId?: string | null;
  isDragOver: boolean;
  uploading: boolean;
  onSelectFiles: () => void;
  onDragEnter: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}

export function KnowledgeUploadZone(props: KnowledgeUploadZoneProps) {
  return (
    <div
      onDragEnter={props.onDragEnter}
      onDragOver={props.onDragOver}
      onDragLeave={props.onDragLeave}
      onDrop={props.onDrop}
      className={cn(
        "rounded-3xl border border-dashed p-4 transition-all sm:p-5",
        props.selectedFolderId
          ? props.isDragOver
            ? "border-primary/40 bg-primary/[0.06] shadow-sm"
            : "border-primary/20 bg-primary/[0.025]"
          : "border-border bg-black/[0.02]",
      )}
    >
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <div className={cn(
            "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ring-1 shadow-sm",
            props.selectedFolderId
              ? "bg-primary/10 text-primary ring-primary/15"
              : "bg-slate-900/[0.04] text-slate-600 ring-slate-900/8",
          )}>
            <UploadCloud className="h-5 w-5" strokeWidth={2.1} />
            <div className="absolute inset-[3px] rounded-[14px] border border-white/40" />
          </div>
          <div className="space-y-1">
            <p className="font-medium text-slate-900">
              {props.selectedFolderId ? "Kéo thả file vào đây hoặc chọn file từ máy" : "Chọn folder để bật upload zone"}
            </p>
            <p className="text-sm text-muted-foreground">
              Hỗ trợ upload nhiều file PDF hoặc JSON. PDF sẽ OCR/extract rồi GraphRAG, JSON sẽ parse trực tiếp để embedding và nối quan hệ tri thức.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <Button
            variant="outline"
            onClick={props.onSelectFiles}
            disabled={!props.selectedFolderId || props.uploading}
            className="min-w-[128px] w-full shrink-0 whitespace-nowrap sm:w-auto"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            Chọn file
          </Button>
          <Badge variant="outline" className="min-h-11 max-w-full justify-center px-3 py-2 text-center text-xs sm:justify-start sm:text-left">
            {props.selectedFolderName ? `Folder đích: ${props.selectedFolderName}` : "Chưa chọn folder"}
          </Badge>
        </div>
      </div>
    </div>
  );
}
