"use client";

import { useEffect, useState } from "react";
import { History, FolderOpen, Loader2 } from "lucide-react";
import { RecentUpload } from "@/apis/aiApi";
import { RecentFileItem } from "@/components/atoms/k/RecentFileItem";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { cn } from "@/lib/utils";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";

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
    null,
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

  return (
    <>
      <div className={cn("flex min-h-[320px] min-w-0 flex-col", className)}>
        <div className="space-y-3 border-b border-border/50 pb-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
              <History className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-foreground">
                File gần đây
              </h2>
              <p className="text-sm text-muted-foreground">
                Chọn nhanh tài liệu đã tải lên để tiếp tục tạo đề hoặc flashcard.
              </p>
            </div>
          </div>

          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground/80">
            {recentUploads.length > 0
              ? `${recentUploads.length} tài liệu khả dụng`
              : "Danh sách tài liệu"}
          </p>
        </div>

        {isLoading ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="mb-3 h-8 w-8 animate-spin" />
            <p className="text-sm">Đang tải...</p>
          </div>
        ) : recentUploads.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-black/5">
              <FolderOpen className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">Chưa có file nào</p>
            <p className="mt-1 text-xs text-muted-foreground/60">
              Upload file PDF để bắt đầu
            </p>
          </div>
        ) : (
          <ScrollArea className="mt-4 h-[320px] md:h-[420px] xl:h-[calc(100vh-14rem)] xl:max-h-[560px]">
            <div className="space-y-2 pr-4">
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
          </ScrollArea>
        )}
      </div>

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="border-border bg-background/95 backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Xóa file?</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc muốn xóa file &quot;{uploadToDelete?.filename}&quot;?
              Hành động này sẽ xóa cả lịch sử câu hỏi và flashcard đã tạo từ
              file này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer border-border bg-black/5">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="border border-red-500/30 bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
