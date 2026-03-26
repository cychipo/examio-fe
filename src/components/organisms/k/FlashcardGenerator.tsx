"use client";

import React from "react";

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
import ModelSelector from "@/components/atoms/ModelSelector";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Field, FieldContent, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ItemFileDetail } from "@/components/atoms/k/ItemFileDetail";
import ModernLoader from "@/components/ui/modern-loader";
import { FlipCard } from "@/components/atoms/k/FlipCard";
import { useFlashcardGeneratorStore } from "@/stores/useAIGeneratorStore";
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

  useGenerationGuard(isGenerating);

  const { toast } = useToast();
  const displayFileName = file?.name || fileInfo?.name;
  const displayFileSize = file?.size || fileInfo?.size;
  const hasFile = !!file || !!uploadId;

  const handleFileUpload = async (uploadedFile: File) => {
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
    if (file) {
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
      } catch {
        // Ignored
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
    <div className="grid w-full gap-6 xl:grid-cols-[minmax(320px,0.82fr)_minmax(0,1.18fr)] xl:items-start">
      <Card className="h-fit w-full border-border bg-white/[0.02] backdrop-blur-xl">
        <CardHeader className="px-5 md:px-6">
          <CardTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
              <Upload className="h-4 w-4 text-primary" />
            </div>
            Tải lên tài liệu
          </CardTitle>
          <CardDescription>
            Tải lên file PDF để AI tạo flashcard tự động
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 px-5 md:px-6">
          {!hasFile ? (
            <FileUpload
              acceptedFileTypes={[".pdf", "application/pdf"]}
              maxFileSize={104857600}
              className="h-full w-full"
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

          <div className="space-y-3">
            <Label className="text-muted-foreground">AI Model</Label>
            <ModelSelector
              value={selectedModel}
              onChange={(value) => setSelectedModel(value as any)}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <Label className="text-muted-foreground">Số lượng thẻ</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={cardCount}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value);
                    if (!Number.isNaN(val)) setCardCount(val);
                  }}
                  className="h-8 w-16 border-none bg-primary/10 px-1 text-center text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/30"
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
            <p className="text-[10px] italic text-muted-foreground">
              * Tối đa 100 thẻ flashcard.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-black/5 p-3">
            <Label
              htmlFor="narrow-toggle"
              className="flex cursor-pointer items-center gap-2 text-muted-foreground"
            >
              Định dạng thẻ hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 text-muted-foreground/60" />
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
              className="cursor-pointer data-[state=checked]:bg-primary"
            />
          </div>

          {isNarrow && (
            <div className="animate-in slide-in-from-top-2 space-y-2 duration-200">
              <Field>
                <FieldLabel htmlFor="keyword-input">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="border-border bg-black/5"
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!hasFile || isGenerating}
            className="h-12 w-full bg-gradient-to-r from-primary to-primary/80 text-base font-medium shadow-lg shadow-primary/20 hover:from-primary/90 hover:to-primary/70"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Đang tạo flashcard...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Tạo flashcard
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full border-border bg-white/[0.02] backdrop-blur-xl xl:min-h-[760px]">
        <CardHeader className="gap-4 border-b border-border/50 px-5 pb-5 md:px-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-green-500/20 bg-gradient-to-br from-green-500/20 to-green-500/5">
                  <SquareSplitVertical className="h-4 w-4 text-green-400" />
                </div>
                Xem trước flashcard
              </CardTitle>
              <CardDescription>
                Tập trung vào phần thẻ học để lật, xem và lưu nhanh kết quả.
              </CardDescription>
            </div>

            {generatedCards && generatedCards.length > 0 && !isGenerating && (
              <DialogAddExam
                title="Lưu vào flashcard set"
                description="Lưu flashcard vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                type={DialogAddExamType.FLASH_CARD}
              >
                <Button
                  variant="outline"
                  size="sm"
                  className="cursor-pointer border-border bg-black/5"
                >
                  <SaveAll size={15} className="mr-2" />
                  Lưu
                </Button>
              </DialogAddExam>
            )}
          </div>

          {generatedCards && generatedCards.length > 0 && !isGenerating && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border bg-black/5 px-3 py-1 font-medium text-foreground">
                {generatedCards.length} thẻ flashcard
              </span>
              {isNarrow && keyword && (
                <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  {keyword}
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="flex flex-1 flex-col px-5 md:px-6">
          {isGenerating ? (
            <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-[28px] border border-border/60 bg-black/[0.04] px-6">
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
            <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-black/[0.03] px-6 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-black/5">
                <SquareSplitVertical className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="max-w-md text-sm text-muted-foreground md:text-base">
                Tải lên file PDF và nhấn Tạo flashcard để xem kết quả.
              </p>
            </div>
          ) : (
            <div className="flex min-h-[420px] flex-1 flex-col rounded-[28px] border border-border/60 bg-gradient-to-br from-black/[0.04] via-black/[0.02] to-primary/[0.06] p-4 md:p-6">
              <div className="flex items-center justify-center">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-semibold text-primary">
                  <span className="text-primary/80">Thẻ</span>
                  <span>{currentCard + 1}</span>
                  <span className="text-primary/50">/</span>
                  <span>{generatedCards.length}</span>
                </div>
              </div>

              <div className="flex flex-1 items-center justify-center py-4 md:py-8">
                {generatedCards[currentCard] && (
                  <div className="mx-auto w-full max-w-2xl">
                    <FlipCard
                      key={currentCard}
                      className="w-full"
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
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className="cursor-pointer border-border bg-black/5"
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextCard}
                  disabled={currentCard === generatedCards.length - 1}
                  className="cursor-pointer border-border bg-black/5"
                >
                  Sau
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
