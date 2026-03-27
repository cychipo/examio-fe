import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { GenAIKnowledgeFolderIcon } from "@/types/genai-knowledge";

import { FOLDER_ICON_OPTIONS, getIconAccent, iconMap } from "./knowledge-constants";

interface KnowledgeFolderDialogProps {
  open: boolean;
  editingFolderId: string | null;
  folderName: string;
  folderDescription: string;
  folderIcon: GenAIKnowledgeFolderIcon;
  onOpenChange: (open: boolean) => void;
  onFolderNameChange: (value: string) => void;
  onFolderDescriptionChange: (value: string) => void;
  onFolderIconChange: (value: GenAIKnowledgeFolderIcon) => void;
  onSave: () => void;
}

export function KnowledgeFolderDialog(props: KnowledgeFolderDialogProps) {
  const ActiveIcon = iconMap[props.folderIcon] || iconMap.Folder;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <DialogContent className="max-w-xl rounded-[24px] p-4 sm:rounded-[28px] sm:p-6">
        <DialogHeader>
          <DialogTitle>{props.editingFolderId ? "Cập nhật folder" : "Tạo folder mới"}</DialogTitle>
          <DialogDescription>
            Chọn tên, mô tả và icon để tổ chức kho tri thức rõ ràng hơn. Bộ icon dùng từ Lucide - thư viện icon uy tín, phổ biến và đã tích hợp sẵn trong dự án.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên folder</label>
            <Input
              placeholder="Ví dụ: Python Cơ Bản, Thuật toán C, Debugging Patterns"
              value={props.folderName}
              onChange={event => props.onFolderNameChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mô tả</label>
            <Textarea
              placeholder="Mô tả ngắn mục đích của folder, phạm vi nội dung, hoặc nhóm học liệu mà GenAI sẽ sử dụng sau này."
              value={props.folderDescription}
              onChange={event => props.onFolderDescriptionChange(event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Icon</label>
            <div className="rounded-2xl border border-border bg-black/[0.02] p-3">
              <div className="mb-3 flex items-center gap-3 rounded-2xl border border-border/70 bg-white/80 p-3">
                <div className={cn(
                  "relative flex h-12 w-12 items-center justify-center rounded-[18px] ring-1 shadow-sm",
                  getIconAccent(props.folderIcon),
                )}>
                  <ActiveIcon className="h-5 w-5" strokeWidth={2.1} />
                  <div className="absolute inset-[3px] rounded-[14px] border border-white/40" />
                </div>
                <div>
                  <div className="text-sm font-medium">Icon đang chọn</div>
                  <div className="text-xs text-muted-foreground">
                    {FOLDER_ICON_OPTIONS.find(option => option.value === props.folderIcon)?.label || "Folder"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                {FOLDER_ICON_OPTIONS.map((option) => {
                  const Icon = option.Icon;
                  const isActive = props.folderIcon === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => props.onFolderIconChange(option.value)}
                      className={cn(
                        "group flex min-h-[92px] flex-col items-center justify-start gap-2 rounded-2xl border px-2 py-3 text-center transition-all",
                        isActive
                          ? "border-primary/35 bg-primary/[0.08] shadow-sm"
                          : "border-border bg-white/75 hover:border-primary/20 hover:bg-primary/[0.04]",
                      )}
                    >
                      <div className={cn(
                        "relative flex h-11 w-11 items-center justify-center rounded-[16px] ring-1 shadow-sm transition-transform group-hover:scale-[1.04]",
                        getIconAccent(option.value),
                      )}>
                        <Icon className="h-4.5 w-4.5" strokeWidth={2.1} />
                        <div className="absolute inset-[3px] rounded-[12px] border border-white/40" />
                      </div>
                      <span className="line-clamp-2 text-[11px] leading-4 text-muted-foreground">
                        {option.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => props.onOpenChange(false)} className="min-w-[120px] w-full shrink-0 whitespace-nowrap sm:w-auto">Hủy</Button>
          <Button onClick={props.onSave} className="min-w-[148px] w-full shrink-0 whitespace-nowrap sm:w-auto">{props.editingFolderId ? "Lưu thay đổi" : "Tạo folder"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
