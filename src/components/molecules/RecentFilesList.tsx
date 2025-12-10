"use client";

import { useEffect, useState } from "react";
import { History, FolderOpen, Loader2 } from "lucide-react";
import { RecentFileItem } from "@/components/atoms/k/RecentFileItem";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";
import { RecentUpload } from "@/apis/aiApi";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface RecentFilesListProps {
  className?: string;
  onSelectUpload?: (upload: RecentUpload) => void;
}

export function RecentFilesList({
  className,
  onSelectUpload,
}: RecentFilesListProps) {
  const {
    recentUploads,
    isLoading,
    isDeleting,
    selectedUpload,
    selectUpload,
    fetchRecentUploads,
    deleteUpload,
  } = useRecentUploadsStore();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [uploadToDelete, setUploadToDelete] = useState<RecentUpload | null>(
    null
  );

  useEffect(() => {
    fetchRecentUploads();
  }, [fetchRecentUploads]);

  const handleDelete = (upload: RecentUpload) => {
    setUploadToDelete(upload);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (uploadToDelete) {
      await deleteUpload(uploadToDelete.id);
      setDeleteConfirmOpen(false);
      setUploadToDelete(null);
    }
  };

  const handleSelect = (upload: RecentUpload) => {
    selectUpload(upload);
    onSelectUpload?.(upload);
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 text-muted-foreground",
          className
        )}>
        <Loader2 className="w-8 h-8 animate-spin mb-3" />
        <p className="text-sm">Đang tải...</p>
      </div>
    );
  }

  if (recentUploads.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col items-center justify-center py-12 text-center",
          className
        )}>
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 border border-border">
          <FolderOpen className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground text-sm">Chưa có file nào</p>
        <p className="text-muted-foreground/60 text-xs mt-1">
          Upload file PDF để bắt đầu
        </p>
      </div>
    );
  }

  return (
    <>
      <div className={cn("space-y-2", className)}>
        <div className="flex items-center gap-2 mb-3 px-1">
          <History className="w-4 h-4 text-primary" />
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            File gần đây ({recentUploads.length})
          </span>
        </div>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1 scrollbar-thin">
          {recentUploads.map((upload) => (
            <RecentFileItem
              key={upload.id}
              upload={upload}
              isSelected={selectedUpload?.id === upload.id}
              isDeleting={isDeleting}
              onSelect={handleSelect}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa file?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa file &quot;{uploadToDelete?.filename}&quot;?
              Hành động này sẽ xóa cả lịch sử câu hỏi và flashcard đã tạo từ
              file này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-border hover:bg-white/10">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30">
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
