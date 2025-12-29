"use client";

import { useState, useRef } from "react";
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
import { Loader2, ImageIcon, Upload, Link2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mediaApi } from "@/apis/mediaApi";
import { toast } from "@/components/ui/toast";

interface ImageUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (url: string) => void;
  title?: string;
  description?: string;
}

/**
 * ImageUrlDialog - Modal để nhập URL hoặc upload hình ảnh
 * Hỗ trợ 2 cách:
 * - Nhập URL trực tiếp
 * - Upload file ảnh (max 2MB)
 */
export function ImageUrlDialog({
  open,
  onOpenChange,
  onConfirm,
  title = "Chèn hình ảnh",
  description = "Nhập URL hoặc upload hình ảnh (tối đa 2MB).",
}: ImageUrlDialogProps) {
  const [activeTab, setActiveTab] = useState<"url" | "upload">("url");
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [previewError, setPreviewError] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetAndClose = () => {
    setUrl("");
    setPreviewError(false);
    setSelectedFile(null);
    setUploadPreview(null);
    setActiveTab("url");
    onOpenChange(false);
  };

  const handleConfirmUrl = () => {
    if (!url.trim()) return;
    onConfirm(url.trim());
    resetAndClose();
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    try {
      const result = await mediaApi.uploadImage(selectedFile);
      onConfirm(result.url);
      resetAndClose();
      toast.success("Upload thành công!");
    } catch (error) {
      toast.error("Lỗi upload", {
        description:
          error instanceof Error ? error.message : "Không thể upload ảnh",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Chỉ chấp nhận file ảnh");
      return;
    }

    // Validate file size (max 2MB)
    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File quá lớn", {
        description: `Kích thước tối đa 2MB. File của bạn: ${(
          file.size /
          (1024 * 1024)
        ).toFixed(2)}MB`,
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const isValidUrl = (urlString: string) => {
    try {
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
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as "url" | "upload")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              URL
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload
            </TabsTrigger>
          </TabsList>

          <TabsContent value="url" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="image-url">URL hình ảnh</Label>
              <Input
                id="image-url"
                type="url"
                placeholder="https://example.com/image.jpg"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setPreviewError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && url.trim() && isValidUrl(url)) {
                    handleConfirmUrl();
                  }
                }}
              />
            </div>

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
          </TabsContent>

          <TabsContent value="upload" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Chọn file ảnh (tối đa 2MB)</Label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                {selectedFile ? selectedFile.name : "Chọn file..."}
              </Button>
            </div>

            {uploadPreview && (
              <div className="space-y-2">
                <Label>Xem trước</Label>
                <div className="border rounded-lg p-2 bg-muted/30">
                  <img
                    src={uploadPreview}
                    alt="Preview"
                    className="max-w-full max-h-40 mx-auto rounded object-contain"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {(selectedFile!.size / 1024).toFixed(1)} KB
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <DialogFooter className="gap-x-2">
          <Button
            variant="outline"
            onClick={resetAndClose}
            disabled={isLoading}>
            Hủy
          </Button>
          {activeTab === "url" ? (
            <Button
              onClick={handleConfirmUrl}
              disabled={!url.trim() || !isValidUrl(url) || isLoading}>
              Chèn hình ảnh
            </Button>
          ) : (
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Upload & Chèn
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
