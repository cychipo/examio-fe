import { Trash2, UploadCloud } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PendingKnowledgeUpload } from "@/types/genai-knowledge";

import { formatBytes } from "./knowledge-constants";

interface KnowledgePendingUploadListProps {
  pendingUploads: PendingKnowledgeUpload[];
  uploading: boolean;
  onUploadAll: () => void;
  onRemove: (id: string) => void;
  onChangeDescription: (id: string, description: string) => void;
}

export function KnowledgePendingUploadList({
  pendingUploads,
  uploading,
  onUploadAll,
  onRemove,
  onChangeDescription,
}: KnowledgePendingUploadListProps) {
  return (
    <div className="rounded-3xl border border-border bg-black/[0.02] p-4">
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-medium">Hàng chờ upload thật</p>
        <Button
          onClick={onUploadAll}
          disabled={pendingUploads.length === 0 || uploading}
          className="min-w-[168px] w-full sm:w-auto"
        >
          <UploadCloud className="mr-2 h-4 w-4" />
          Upload toàn bộ queue
        </Button>
      </div>

      {pendingUploads.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Chọn file hoặc kéo thả file vào upload zone để tạo queue upload. Mỗi file có thể nhập mô tả riêng trước khi gửi lên R2.
        </p>
      ) : (
        <div className="space-y-3">
          {pendingUploads.map(item => (
            <div key={item.id} className="space-y-2 rounded-2xl border border-border/70 bg-white/70 p-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{item.file.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{formatBytes(item.file.size)} · {item.file.type || "unknown"}</div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)} className="shrink-0">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Mô tả ngắn cho file này trước khi upload"
                value={item.description || ""}
                onChange={event => onChangeDescription(item.id, event.target.value)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
