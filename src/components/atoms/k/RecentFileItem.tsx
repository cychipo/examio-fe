"use client";

import { FileText, Clock, Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { RecentUpload } from "@/apis/aiApi";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface RecentFileItemProps {
  upload: RecentUpload;
  isSelected?: boolean;
  isDeleting?: boolean;
  onSelect?: (upload: RecentUpload) => void;
  onDelete?: (upload: RecentUpload) => void;
}

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  return date.toLocaleDateString("vi-VN");
}

export function RecentFileItem({
  upload,
  isSelected,
  isDeleting,
  onSelect,
  onDelete,
}: RecentFileItemProps) {
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const hasQuiz = !!upload.quizHistory;
  const hasFlashcard = !!upload.flashcardHistory;

  return (
    <div
      className={cn(
        "group relative flex items-start gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer",
        "bg-white/5 cursor-pointer border border-border hover:border-border",
        isSelected && "bg-white/15 border-primary/50 ring-1 ring-primary/30",
        isDeleting && "opacity-50 pointer-events-none"
      )}
      onClick={() => !isDeleting && onSelect?.(upload)}>
      {/* File Icon */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
        <FileText className="w-5 h-5 text-primary" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate pr-8">
          {upload.filename}
        </p>
        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatTimeAgo(upload.createdAt)}</span>
          <span>•</span>
          <span>{formatFileSize(upload.size)}</span>
        </div>

        {/* Tags */}
        <div className="flex items-center gap-1.5 mt-2">
          {hasQuiz && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20 flex items-center">
              {upload.quizHistory?.quizzes?.length || 0} câu hỏi
            </Badge>
          )}
          {hasFlashcard && (
            <Badge
              variant="secondary"
              className="text-[10px] px-1.5 py-0 h-5 bg-green-500/10 text-green-400 border-green-500/20 hover:bg-green-500/20 flex items-center">
              {upload.flashcardHistory?.flashcards?.length || 0} thẻ
            </Badge>
          )}
        </div>
      </div>

      {/* Delete Button - Show on hover */}
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 bg-red-500/10 hover:bg-red-500/20 text-red-400"
          disabled={isDeleting}
          onClick={(e) => {
            e.stopPropagation();
            onDelete?.(upload);
          }}
          title="Xóa file">
          {isDeleting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Trash2 className="w-3.5 h-3.5" />
          )}
        </Button>
      </div>
    </div>
  );
}
