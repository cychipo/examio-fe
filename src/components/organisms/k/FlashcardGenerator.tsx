"use client";

import type React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  SquareSplitVertical,
  ChevronLeft,
  ChevronRight,
  Upload,
  CircleHelp,
  Sparkles,
  Loader2,
  SaveAll,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import FileUpload from "@/components/kokonutui/file-upload";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ItemFileDetail } from "@/components/atoms/k/ItemFileDetail";
import ModernLoader from "@/components/ui/modern-loader";
import { FlipCard } from "@/components/atoms/k/FlipCard";
import { useFlashcardGeneratorStore } from "@/stores/useAIGeneratorStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { AI_MODELS } from "@/types/ai";
import { validatePdfPageCount } from "@/lib/pdfUtils";
import {
  DialogAddExam,
  DialogAddExamType,
} from "@/components/organisms/k/DialogAddExam";
import { useGenerationGuard } from "@/hooks/useGenerationGuard";

export function FlashcardGenerator() {
  const {
    file,
    uploadId,
    fileInfo,
    cardCount,
    isNarrow,
    keyword,
    generatedCards,
    currentCard,
    isGenerating,
    selectedModel,
    setFile,
    setCardCount,
    setIsNarrow,
    setKeyword,
    setCurrentCard,
    setSelectedModel,
    generateFlashcards,
    clearFlashcards,
  } = useFlashcardGeneratorStore();
  const { user } = useAuthStore();

  // Guard against page reload during generation
  useGenerationGuard(isGenerating);

  const { toast } = useToast();

  // File info cho hiển thị (từ file upload hoặc từ recent files)
  const displayFileName = file?.name || fileInfo?.name;
  const displayFileSize = file?.size || fileInfo?.size;
  const hasFile = !!file || !!uploadId;

  const handleFileUpload = async (uploadedFile: File) => {
    // Validate PDF page count before accepting the file
    try {
      const { valid, pageCount } = await validatePdfPageCount(uploadedFile);
      if (!valid) {
        toast({
          title: "File PDF quá lớn",
          description: `File có ${pageCount} trang. Giới hạn tối đa là 50 trang.`,
          variant: "destructive",
        });
        return;
      }
    } catch (error) {
      toast({
        title: "Lỗi đọc file PDF",
        description:
          error instanceof Error ? error.message : "Không thể đọc file PDF",
        variant: "destructive",
      });
      return;
    }

    setFile(uploadedFile);
    toast({
      title: "File đã được tải lên",
      description: `${uploadedFile.name} (${(
        uploadedFile.size /
        1024 /
        1024
      ).toFixed(2)} MB)`,
    });
  };

  const handleFileError = (error: { message: string; code: string }) => {
    toast({
      title: "Lỗi tải file",
      description: error.message,
      variant: "destructive",
    });
  };

  const handleRemoveFile = () => {
    clearFlashcards();
    toast({
      title: "Đã xóa file",
      description: "Vui lòng tải lên file mới",
    });
  };

  const handleGenerate = async () => {
    // Check credits
    if (file) {
      // Validate PDF page count
      try {
        const { valid, pageCount } = await validatePdfPageCount(file);
        if (!valid) {
          toast({
            title: "File PDF quá lớn",
            description: `File có ${pageCount} trang. Giới hạn tối đa là 50 trang.`,
            variant: "warning",
          });
          return;
        }
      } catch (error) {
        toast({
          title: "Lỗi đọc file PDF",
          description:
            error instanceof Error ? error.message : "Không thể đọc file PDF",
          variant: "destructive",
        });
        return;
      }

      const cost = Math.max(2, Math.ceil(file.size / (1024 * 1024)));
      if (user && user.wallet.balance < cost) {
        toast({
          title: "Không đủ tín dụng",
          description: `Bạn cần ${cost} credits để tạo flashcard từ file này.`,
          variant: "warning",
        });
        return;
      }
    }

    await generateFlashcards();
  };

  const nextCard = () => {
    if (generatedCards && currentCard < generatedCards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  return (
    <div className="gap-6 flex w-full flex-col">
      {/* Upload & Settings */}
      <Card className="border-border bg-white/[0.02] backdrop-blur-xl h-fit w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <Upload className="w-4 h-4 text-primary" />
            </div>
            Tải lên tài liệu
          </CardTitle>
          <CardDescription>
            Tải lên file PDF để AI tạo flashcard tự động
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!hasFile ? (
            <FileUpload
              acceptedFileTypes={[".pdf", "application/pdf"]}
              maxFileSize={104857600}
              className="w-full h-full"
              onUploadSuccess={handleFileUpload}
              onUploadError={handleFileError}
              uploadDelay={2000}
            />
          ) : (
            <ItemFileDetail
              fileName={displayFileName || "Unknown file"}
              fileSize={displayFileSize || 0}
              onRemove={handleRemoveFile}
            />
          )}

          {/* AI Model Selection */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">AI Model</Label>
            <Select
              value={selectedModel}
              onValueChange={(value) => setSelectedModel(value as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn model AI" />
              </SelectTrigger>
              <SelectContent>
                {AI_MODELS.map((model) => (
                  <SelectItem key={model.id} value={model.id} disabled={false}>
                    <div className="flex items-center gap-2">
                      <span>{model.icon}</span>
                      <div className="flex flex-col items-start">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {model.description}
                        </span>
                      </div>
                      {model.badge && (
                        <span className="ml-auto text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full uppercase font-bold tracking-wider">
                          {model.badge}
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Số lượng thẻ</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={cardCount}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value);
                    if (!Number.isNaN(val)) setCardCount(val);
                  }}
                  className="w-16 h-8 text-center px-1 text-xs font-bold bg-primary/10 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                  min={1}
                  max={100}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  thẻ
                </span>
              </div>
            </div>
            <Slider
              value={[Math.min(cardCount, 100)]}
              onValueChange={(value) => setCardCount(value[0])}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Tối đa 100 thẻ flashcard.
            </p>
          </div>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 dark:bg-white/5 border border-border">
            <Label
              htmlFor="narrow-toggle"
              className="flex items-center gap-2 cursor-pointer text-muted-foreground"
            >
              Định dạng thẻ hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="w-4 h-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  Bật để tạo thẻ flashcard tập trung vào từ khóa mà bạn nhập
                  thay vì toàn file PDF
                </TooltipContent>
              </Tooltip>
            </Label>
            <Switch
              id="narrow-toggle"
              checked={isNarrow}
              onCheckedChange={setIsNarrow}
              className="data-[state=checked]:bg-primary cursor-pointer"
            />
          </div>

          {isNarrow && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Field>
                <FieldLabel htmlFor="keyword-input">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="bg-black/5 dark:bg-white/5 border-border"
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!hasFile || isGenerating}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tạo flashcard...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Tạo flashcard
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Flashcard Preview */}
      <Card className="border-border bg-white/[0.02] backdrop-blur-xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500/20 to-green-500/5 flex items-center justify-center border border-green-500/20">
              <SquareSplitVertical className="w-4 h-4 text-green-400" />
            </div>
            Xem trước flashcard
          </CardTitle>
          <CardDescription>
            Nhấn vào thẻ để lật và xem câu trả lời
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <ModernLoader
                words={[
                  "Đang phân tích tài liệu…",
                  "Trích xuất thông tin…",
                  "Hiểu nội dung…",
                  "Xác minh dữ liệu…",
                  "Suy nghĩ về chủ đề…",
                  "Lập kế hoạch flashcard…",
                  "Tạo flashcard…",
                  "Đánh giá đáp án…",
                  "Kiểm tra độ chính xác…",
                  "Đảm bảo tính đa dạng…",
                  "Tối ưu hóa định dạng…",
                  "Chuẩn bị để hiển thị…",
                ]}
              />
            </div>
          ) : !generatedCards || generatedCards.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-black/5 dark:bg-white/5 border border-border flex items-center justify-center mb-4">
                <SquareSplitVertical className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo flashcard để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header with Download and Save Buttons */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{generatedCards.length} thẻ</span>
                  {isNarrow && keyword && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {keyword}
                    </span>
                  )}
                </div>
                <div className="flex gap-2">
                  <DialogAddExam
                    title="Lưu vào flashcard set"
                    description="Lưu flashcard vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                    type={DialogAddExamType.FLASH_CARD}
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-black/5 dark:bg-white/5 border-border cursor-pointer"
                    >
                      <SaveAll size={15} className="mr-2" />
                      Lưu
                    </Button>
                  </DialogAddExam>
                </div>
              </div>

              {/* Card Counter */}
              <div className="text-center">
                <span className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">
                  Thẻ {currentCard + 1} / {generatedCards.length}
                </span>
              </div>

              {/* Flashcard */}
              {generatedCards[currentCard] && (
                <FlipCard
                  key={currentCard}
                  front={{
                    label: "Câu hỏi",
                    content: generatedCards[currentCard].question,
                    hint: "Nhấn để xem câu trả lời",
                  }}
                  back={{
                    label: "Câu trả lời",
                    content: generatedCards[currentCard].answer,
                  }}
                />
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className="flex-1 bg-black/5 dark:bg-white/5 border-border cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextCard}
                  disabled={currentCard === generatedCards.length - 1}
                  className="flex-1 bg-black/5 dark:bg-white/5 border-border cursor-pointer"
                >
                  Sau
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
