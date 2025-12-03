import React, { useState, useRef } from "react";
import { X, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface ThumbnailUploadProps {
  value?: string | File | null;
  onChange: (value: string | File | null) => void;
  label?: string;
  className?: string;
}

export function ThumbnailUpload({
  value,
  onChange,
  label = "Thumbnail",
  className,
}: ThumbnailUploadProps) {
  const [urlInput, setUrlInput] = useState("");
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    typeof value === "string" ? value : null
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange(file);
      setUrlInput("");
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      setPreviewUrl(urlInput);
      onChange(urlInput);
    }
  };

  const handleClear = () => {
    setPreviewUrl(null);
    setUrlInput("");
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);

      onChange(file);
      setUrlInput("");
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className={cn("space-y-3", className)}>
      <Label>{label}</Label>

      {/* Preview */}
      {previewUrl && (
        <div className="relative w-full h-48 border rounded-lg overflow-hidden bg-muted">
          <img
            src={previewUrl}
            alt="Thumbnail preview"
            className="w-full h-full object-cover"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2"
            onClick={handleClear}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload area */}
      {!previewUrl && (
        <div
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-1">
            Click to upload or drag and drop
          </p>
          <p className="text-xs text-muted-foreground">
            PNG, JPG, GIF up to 10MB
          </p>
        </div>
      )}

      {/* URL input */}
      {!previewUrl && (
        <div className="flex gap-2">
          <Input
            type="url"
            placeholder="Or paste image URL"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleUrlSubmit();
              }
            }}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleUrlSubmit}
            disabled={!urlInput.trim()}>
            Add
          </Button>
        </div>
      )}
    </div>
  );
}
