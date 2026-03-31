import { Badge } from "@/components/ui/badge";
import { GenAIKnowledgeFolder } from "@/types/genai-knowledge";
import { cn } from "@/lib/utils";

import { FolderOpen, Folder } from "lucide-react";

import { getIconAccent, iconMap } from "./knowledge-constants";

interface KnowledgeFolderListProps {
  folders: GenAIKnowledgeFolder[];
  selectedFolderId: string | null;
  fileCountByFolderId: Map<string, number>;
  onSelectFolder: (folderId: string) => void;
}

export function KnowledgeFolderList({
  folders,
  selectedFolderId,
  fileCountByFolderId,
  onSelectFolder,
}: KnowledgeFolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-black/5 px-4 py-10 text-center">
        <FolderOpen className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
        <p className="font-medium">Chưa có folder nào</p>
        <p className="mt-1 text-sm text-muted-foreground">Tạo folder đầu tiên để bắt đầu tổ chức kho tri thức.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {folders.map((folder) => {
        const FolderIcon = iconMap[folder.icon] || Folder;
        const fileCount = folder.fileCount ?? fileCountByFolderId.get(folder.id) ?? 0;

        return (
          <button
            key={folder.id}
            type="button"
            onClick={() => onSelectFolder(folder.id)}
            className={cn(
              "w-full rounded-2xl border px-3 py-3 text-left transition-all sm:px-4 sm:py-4",
              selectedFolderId === folder.id
                ? "border-primary/40 bg-primary/8 shadow-sm"
                : "border-border bg-black/[0.03] hover:border-primary/20 hover:bg-primary/[0.04]",
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-[18px] ring-1 shadow-sm",
                getIconAccent(folder.icon),
              )}>
                <FolderIcon className="h-5 w-5" strokeWidth={2.1} />
                <div className="absolute inset-[3px] rounded-[14px] border border-white/40" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="truncate font-medium leading-5">{folder.name}</p>
                  <Badge variant="outline" className="shrink-0 text-[11px]">{fileCount} file</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {folder.description || "Chưa có mô tả cho folder này."}
                </p>
                <div className="mt-2 flex flex-wrap gap-1 text-[10px] text-muted-foreground">
                  <span>OK {folder.completedCount ?? 0}</span>
                  <span>•</span>
                  <span>Running {folder.processingCount ?? 0}</span>
                  <span>•</span>
                  <span>Fail {folder.failedCount ?? 0}</span>
                </div>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
