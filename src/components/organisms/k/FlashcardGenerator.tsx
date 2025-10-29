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
  CircleQuestionMark,
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
import { ItemFileDetail } from "@/components/atoms/k/ItemFileDetail";
import ModernLoader from "@/components/ui/modern-loader";
import { FlipCard } from "@/components/atoms/k/FlipCard";
import { useFlashcardGeneratorStore } from "@/stores/useAIGeneratorStore";
import {
  DialogAddExam,
  DialogAddExamType,
} from "@/components/organisms/k/DialogAddExam";

export function FlashcardGenerator() {
  const {
    file,
    cardCount,
    isNarrow,
    keyword,
    generatedCards,
    currentCard,
    isGenerating,
    setFile,
    setCardCount,
    setIsNarrow,
    setKeyword,
    setCurrentCard,
    generateFlashcards,
    clearFlashcards,
  } = useFlashcardGeneratorStore();

  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
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
    <div className="gap-6 flex w-full flex-col md:flex-row">
      {/* Upload & Settings */}
      <Card className="border-border bg-card h-fit w-full md:w-2/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Tải lên tài liệu
          </CardTitle>
          <CardDescription>
            Tải lên file PDF để AI tạo đề kiểm tra tự động
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <FileUpload
              acceptedFileTypes={[".pdf", "application/pdf"]}
              maxFileSize={10485760}
              className="w-full h-full"
              onUploadSuccess={handleFileUpload}
              onUploadError={handleFileError}
              uploadDelay={2000}
            />
          ) : (
            <ItemFileDetail
              fileName={file.name}
              fileSize={file.size}
              onRemove={handleRemoveFile}
            />
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Số lượng câu hỏi</Label>
              <span className="text-sm font-medium text-primary">
                {cardCount} câu
              </span>
            </div>
            <Slider
              value={[cardCount]}
              onValueChange={(value) => setCardCount(value[0])}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          <div className="flex items-center justify-between">
            <Label
              htmlFor="narrow-toggle"
              className="flex items-center gap-2 cursor-pointer">
              Định dạng thẻ hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={15} />
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
            <div className="space-y-2">
              <Field>
                <FieldLabel htmlFor="keyword-input">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          <Button
            onClick={handleGenerate}
            disabled={!file || isGenerating}
            className="w-full h-12 text-base font-medium"
            size="lg">
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
      <Card className="border-border bg-card w-full md:w-3/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SquareSplitVertical className="w-5 h-5 text-primary" />
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
          ) : !generatedCards ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <SquareSplitVertical className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo flashcard để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Header with Download and Save Buttons */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {file?.name} • {cardCount} flashcards
                  {isNarrow && keyword && ` • Từ khóa: ${keyword}`}
                </div>
                <div className="flex gap-2">
                  <DialogAddExam
                    title="Lưu vào flashcard set"
                    description="Lưu flashcard vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                    type={DialogAddExamType.FLASH_CARD}>
                    <Button variant="outline" size="sm">
                      <SaveAll size={15} className="mr-2" />
                      Lưu
                    </Button>
                  </DialogAddExam>
                </div>
              </div>

              {/* Card Counter */}
              <div className="text-center text-sm text-muted-foreground">
                Thẻ {currentCard + 1} / {generatedCards.length}
              </div>

              {/* Flashcard */}
              <FlipCard
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

              {/* Navigation */}
              <div className="flex items-center justify-between gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevCard}
                  disabled={currentCard === 0}
                  className="flex-1 bg-transparent">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Trước
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={nextCard}
                  disabled={currentCard === generatedCards.length - 1}
                  className="flex-1 bg-transparent">
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
