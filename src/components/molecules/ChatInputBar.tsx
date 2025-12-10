"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Send,
  Mic,
  MicOff,
  Image as ImageIcon,
  FileText,
  Loader2,
  X,
  ChevronDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ChatInputBarProps {
  onSendMessage: (message: string) => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onUploadImage: (file: File) => void;
  onUploadPdf: () => void;
  onSelectRecentFile: () => void;
  isListening: boolean;
  isProcessing: boolean;
  isUploadingImage: boolean;
  transcript: string;
  uploadedImageUrl?: string | null;
  onClearImage: () => void;
  disabled?: boolean;
  isUploadingPdf?: boolean;
}

export function ChatInputBar({
  onSendMessage,
  onStartListening,
  onStopListening,
  onUploadImage,
  onUploadPdf,
  onSelectRecentFile,
  isListening,
  isProcessing,
  isUploadingImage,
  transcript,
  uploadedImageUrl,
  onClearImage,
  disabled = false,
  isUploadingPdf = false,
}: ChatInputBarProps) {
  const [inputValue, setInputValue] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    const message = inputValue.trim() || transcript.trim();
    if (message && !isProcessing) {
      onSendMessage(message);
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadImage(file);
    }
    // Reset input
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const toggleMic = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const displayValue = isListening && transcript ? transcript : inputValue;

  return (
    <div className="relative">
      {/* Image Preview */}
      {uploadedImageUrl && (
        <div className="absolute -top-16 left-4 flex items-center gap-2 bg-white/10 dark:bg-black/20 backdrop-blur-md rounded-lg p-2 border border-border dark:border-border">
          <img
            src={uploadedImageUrl}
            alt="Upload preview"
            className="w-12 h-12 object-cover rounded"
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-red-500/20"
            onClick={onClearImage}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input Container - Glass Effect */}
      <div
        className={cn(
          "flex items-center gap-2 p-2 rounded-xl",
          "bg-white/10 dark:bg-white/[0.05]",
          "backdrop-blur-xl",
          "border border-border dark:border-border",
          "shadow-lg shadow-black/5 dark:shadow-black/20",
          "transition-all duration-300",
          isListening && "ring-2 ring-primary/50"
        )}>
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-purple-500/30 flex items-center justify-center flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/50 to-purple-500/50 flex items-center justify-center">
            <span className="text-white text-sm">👤</span>
          </div>
        </div>

        {/* Text Input */}
        <textarea
          value={displayValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask me anything..."
          disabled={disabled || isProcessing || isUploadingImage || isUploadingPdf}
          rows={1}
          className={cn(
            "flex-1 bg-transparent border-none outline-none resize-none",
            "text-foreground placeholder:text-muted-foreground/60",
            "text-sm md:text-base",
            "py-2 px-2",
            "min-h-[40px] max-h-[120px]",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        />

        {/* Action Buttons */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Image Upload */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
            onClick={() => imageInputRef.current?.click()}
            disabled={disabled || isProcessing || isUploadingImage}>
            {isUploadingImage ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <ImageIcon className="w-5 h-5" />
            )}
          </Button>

          {/* PDF Upload Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-muted-foreground hover:text-foreground cursor-pointer"
                disabled={disabled || isProcessing || isUploadingPdf}>
                {isUploadingPdf ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <FileText className="w-5 h-5" />
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-background/95 backdrop-blur-xl border-border">
              <DropdownMenuItem onClick={onUploadPdf}>
                <FileText className="w-4 h-4 mr-2" />
                Tải file mới
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onSelectRecentFile}>
                <ChevronDown className="w-4 h-4 mr-2" />
                File gần đây
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mic Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-9 w-9",
              isListening
                ? "text-red-500 hover:text-red-600 bg-red-500/10"
                : "text-muted-foreground hover:text-foreground cursor-pointer"
            )}
            onClick={toggleMic}
            disabled={disabled || isProcessing}>
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          {/* Send Button */}
          <Button
            size="sm"
            className={cn(
              "px-4 h-9 rounded-lg font-medium",
              "bg-primary hover:bg-primary/90",
              "text-primary-foreground"
            )}
            onClick={handleSend}
            disabled={
              disabled ||
              isProcessing ||
              (!inputValue.trim() && !transcript.trim())
            }>
            {isProcessing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                Send <Send className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
