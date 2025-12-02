"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ImageIcon } from "lucide-react";

interface ImageUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
  title?: string;
  description?: string;
}

/**
 * ImageUrlDialog - Modal để nhập URL hình ảnh
 * Sử dụng cho RichTextEditor thay vì window.prompt
 */
export function ImageUrlDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Chèn hình ảnh",
  description = "Nhập URL của hình ảnh bạn muốn chèn vào nội dung.",
}: ImageUrlDialogProps) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);

  const handleConfirm = () => {
    if (!url.trim()) return;

    setIsLoading(true);
    onConfirm(url.trim());
    setIsLoading(false);
    setUrl("");
    setPreviewError(false);
    onOpenChange(false);
  };

  const handleCancel = () => {
    setUrl("");
    setPreviewError(false);
    onOpenChange(false);
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setPreviewError(false);
  };

  const isValidUrl = (urlString: string) => {
    try {
      // Validate URL format
      void new URL(urlString);
      return (
        urlString.startsWith("http://") || urlString.startsWith("https://")
      );
    } catch {
      return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="image-url">URL hình ảnh</Label>
            <Input
              id="image-url"
              type="url"
              placeholder="https://example.com/image.jpg"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && url.trim() && isValidUrl(url)) {
                  handleConfirm();
                }
              }}
            />
          </div>

          {/* Image Preview */}
          {url && isValidUrl(url) && (
            <div className="space-y-2">
              <Label>Xem trước</Label>
              <div className="border rounded-lg p-2 bg-muted/30">
                {!previewError ? (
                  <img
                    src={url}
                    alt="Preview"
                    className="max-w-full max-h-40 mx-auto rounded object-contain"
                    onError={() => setPreviewError(true)}
                  />
                ) : (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    Không thể tải hình ảnh từ URL này
                  </div>
                )}
              </div>
            </div>
          )}

          {url && !isValidUrl(url) && (
            <p className="text-sm text-destructive">
              Vui lòng nhập URL hợp lệ (bắt đầu bằng http:// hoặc https://)
            </p>
          )}
        </div>

        <DialogFooter className="gap-x-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Hủy
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!url.trim() || !isValidUrl(url) || isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Chèn hình ảnh
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
