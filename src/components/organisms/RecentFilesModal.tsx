"use client";

import { useEffect, useState } from "react";
import { useIsDesktop } from "@/hooks/useMediaQuery";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { FileText, Loader2, FolderOpen, Check } from "lucide-react";
import { useRecentUploadsStore } from "@/stores/useAIGeneratorStore";
import { RecentUpload } from "@/apis/aiApi";

interface RecentFilesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectFile: (file: RecentUpload) => void;
  selectedFileId?: string;
  /** If false, excludes quiz/flashcard history from response (lighter payload) */
  includeHistory?: boolean;
}

export function RecentFilesModal({
  open,
  onOpenChange,
  onSelectFile,
  selectedFileId,
  includeHistory = true,
}: RecentFilesModalProps) {
  const isDesktop = useIsDesktop();
  const { recentUploads, isLoading, fetchRecentUploads } =
    useRecentUploadsStore();
  const [selectedId, setSelectedId] = useState<string | undefined>(
    selectedFileId
  );

  useEffect(() => {
    if (open) {
      fetchRecentUploads(false, includeHistory);
    }
  }, [open, fetchRecentUploads, includeHistory]);

  useEffect(() => {
    setSelectedId(selectedFileId);
  }, [selectedFileId]);

  const handleSelect = (file: RecentUpload) => {
    setSelectedId(file.id);
  };

  const handleConfirm = () => {
    const selected = recentUploads.find((f) => f.id === selectedId);
    if (selected) {
      onSelectFile(selected);
      onOpenChange(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const content = (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
          <p className="text-sm text-muted-foreground">Đang tải...</p>
        </div>
      ) : recentUploads.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center mb-4 border border-border">
            <FolderOpen className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Chưa có file nào được tải lên</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Upload file PDF để sử dụng với AI
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 pr-2">
              {recentUploads.map((file) => (
                <div
                  key={file.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
                    "cursor-pointer",
                    "border",
                    selectedId === file.id
                      ? "bg-primary/10 border-primary/30"
                      : "border-transparent"
                  )}
                  onClick={() => handleSelect(file)}>
                  <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-5 h-5 text-red-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.filename}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDate(file.createdAt)}
                    </p>
                  </div>
                  {selectedId === file.id && (
                    <Check className="w-5 h-5 text-primary flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-black/5 border-border cursor-pointer">
              Hủy
            </Button>
            <Button onClick={handleConfirm} disabled={!selectedId}>
              Chọn file
            </Button>
          </div>
        </>
      )}
    </div>
  );

  // Desktop: Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg bg-background/95 backdrop-blur-xl border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Chọn file gần đây
            </DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile: Drawer
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-background/95 backdrop-blur-xl border-border max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Chọn file gần đây
          </DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-8">{content}</div>
      </DrawerContent>
    </Drawer>
  );
}
