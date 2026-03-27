import { FileCode2, RotateCcw, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { GenAIKnowledgeFile } from "@/types/genai-knowledge";
import { cn } from "@/lib/utils";

import { formatBytes } from "./knowledge-constants";

interface KnowledgeFileGridProps {
  files: GenAIKnowledgeFile[];
  selectedFileIds: string[];
  onToggleSelection: (fileId: string) => void;
  onReprocess: (file: GenAIKnowledgeFile) => void;
  onDelete: (file: GenAIKnowledgeFile) => void;
}

export function KnowledgeFileGrid({
  files,
  selectedFileIds,
  onToggleSelection,
  onReprocess,
  onDelete,
}: KnowledgeFileGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
      {files.map((file) => (
        <Card key={file.id} className="rounded-3xl border-border/80 bg-white/80">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedFileIds.includes(file.id)}
                  onChange={() => onToggleSelection(file.id)}
                  className="mt-3 h-4 w-4 rounded border-border"
                />
                <div className="relative flex h-12 w-12 items-center justify-center rounded-[18px] bg-slate-900/[0.04] text-slate-700 ring-1 ring-slate-900/8 shadow-sm">
                  <FileCode2 className="h-5 w-5" strokeWidth={2.1} />
                  <div className="absolute inset-[3px] rounded-[14px] border border-white/40" />
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground" onClick={() => onReprocess(file)} title="Xử lý lại file">
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => onDelete(file)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <p className="line-clamp-2 font-medium leading-6">{file.name}</p>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {file.description || "Chưa có mô tả cho file này."}
              </p>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge variant="outline">{formatBytes(file.size)}</Badge>
              <Badge variant="outline">{file.mimeType || "unknown"}</Badge>
              <Badge variant={file.processingStatus === "FAILED" ? "destructive" : "outline"}>
                {file.processingStatus || "PENDING"}
                {typeof file.processingProgress === "number" ? ` · ${file.processingProgress}%` : ""}
              </Badge>
              {typeof file.vectorCount === "number" && file.vectorCount > 0 && (
                <Badge variant="outline">{file.vectorCount} vectors</Badge>
              )}
            </div>

            <div className="mt-3 space-y-2">
              <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className={cn(
                    "h-full rounded-full transition-all",
                    file.processingStatus === "FAILED"
                      ? "bg-red-500"
                      : file.processingStatus === "COMPLETED"
                        ? "bg-emerald-500"
                        : "bg-sky-500",
                  )}
                  style={{ width: `${Math.max(6, file.processingProgress || 0)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{file.processingStage || "queued"}</span>
                <span>{typeof file.processingProgress === "number" ? `${file.processingProgress}%` : "0%"}</span>
              </div>
            </div>

            {file.errorMessage && (
              <p className="mt-3 text-xs text-destructive">{file.errorMessage}</p>
            )}

            {file.processingMessage && !file.errorMessage && (
              <p className="mt-3 text-xs text-muted-foreground">
                {file.processingStage ? `${file.processingStage}: ` : ""}
                {file.processingMessage}
              </p>
            )}

            <div className="mt-4 flex flex-col gap-2 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
              <span>{new Date(file.uploadedAt).toLocaleDateString("vi-VN")}</span>
              <a
                href={file.url}
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary hover:underline"
              >
                Mở file
              </a>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
