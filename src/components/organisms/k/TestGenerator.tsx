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
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Loader2,
  Sparkles,
  SaveAll,
  Upload,
  FileText,
  CircleHelp,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import FileUpload from "@/components/kokonutui/file-upload";
import { ItemFileDetail } from "@/components/atoms/k/ItemFileDetail";
import { ScrollArea } from "@/components/ui/scroll-area";
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
import ModernLoader from "@/components/ui/modern-loader";
import { Quizz } from "@/types/exam";
import { useTestGeneratorStore } from "@/stores/useAIGeneratorStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { AI_MODELS } from "@/types/ai";
import { validatePdfPageCount } from "@/lib/pdfUtils";
import {
  DialogAddExam,
  DialogAddExamType,
} from "@/components/organisms/k/DialogAddExam";
import { cn } from "@/lib/utils";
import { useGenerationGuard } from "@/hooks/useGenerationGuard";

export function TestGenerator() {
  const {
    file,
    uploadId,
    fileInfo,
    questionCount,
    isNarrow,
    keyword,
    generatedTest,
    isGenerating,
    selectedModel,
    setFile,
    setQuestionCount,
    setIsNarrow,
    setKeyword,
    setSelectedModel,
    generateTest,
    clearTest,
  } = useTestGeneratorStore();
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
    clearTest();
    toast({
      title: "Đã xóa file",
      description: "Vui lòng tải lên file mới",
    });
  };

  const handleGenerate = async () => {
    // Check credits
    /* FREE_MODE: Bỏ kiểm tra tín dụng ở frontend
    if (file) {
      // Validate PDF page count
      try {
        const { valid, pageCount } = await validatePdfPageCount(file);
        if (!valid) {
          toast.warning("File PDF quá lớn", {
            description: `File có ${pageCount} trang. Giới hạn tối đa là 50 trang.`,
          });
          return;
        }
      } catch (error) {
        toast.error("Lỗi đọc file PDF", {
          description:
            error instanceof Error ? error.message : "Không thể đọc file PDF",
        });
        return;
      }

      const cost = Math.max(2, Math.ceil(file.size / (1024 * 1024)));
      if (user && user.wallet.balance < cost) {
        toast.warning("Không đủ tín dụng", {
          description: `Bạn cần ${cost} credits để tạo đề từ file này.`,
        });
        return;
      }
    }
    */

    // Thêm check đơn giản cho page count mà không check cost
    if (file) {
      try {
        const { valid, pageCount } = await validatePdfPageCount(file);
        if (!valid) {
          toast.warning("File PDF quá lớn", {
            description: `File có ${pageCount} trang. Giới hạn tối đa là 50 trang.`,
          });
          return;
        }
      } catch (error) {
        // Ignored
      }
    }

    await generateTest();
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
            Tải lên file PDF để AI tạo đề kiểm tra tự động
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
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

          {/* Question Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-muted-foreground">Số lượng câu hỏi</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value);
                    if (!Number.isNaN(val)) setQuestionCount(val);
                  }}
                  className="w-16 h-8 text-center px-1 text-xs font-bold bg-primary/10 border-none focus-visible:ring-1 focus-visible:ring-primary/30"
                  min={1}
                  max={100}
                />
                <span className="text-xs font-medium text-muted-foreground">
                  câu
                </span>
              </div>
            </div>
            <Slider
              value={[Math.min(questionCount, 100)]}
              onValueChange={(value) => setQuestionCount(value[0])}
              min={5}
              max={100}
              step={5}
              className="w-full"
            />
            <p className="text-[10px] text-muted-foreground italic">
              * Tối đa 100 câu hỏi.
            </p>
          </div>

          {/* Narrow Format Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-black/5 border border-border">
            <Label
              htmlFor="narrow-toggle-test"
              className="flex items-center gap-2 cursor-pointer text-muted-foreground"
            >
              Định dạng hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="w-4 h-4 text-muted-foreground/60" />
                </TooltipTrigger>
                <TooltipContent>
                  Bật để tạo đề kiểm tra tập trung vào từ khóa mà bạn nhập thay
                  vì toàn file PDF
                </TooltipContent>
              </Tooltip>
            </Label>
            <Switch
              id="narrow-toggle-test"
              checked={isNarrow}
              onCheckedChange={setIsNarrow}
              className="data-[state=checked]:bg-primary cursor-pointer"
            />
          </div>

          {/* Keyword Input */}
          {isNarrow && (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <Field>
                <FieldLabel htmlFor="keyword-input-test">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input-test"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="bg-black/5 border-border"
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!hasFile || isGenerating}
            className="w-full h-12 text-base font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-lg shadow-primary/20"
            size="lg"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Đang tạo đề...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Tạo đề kiểm tra
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-border bg-white/[0.02] backdrop-blur-xl w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
              <FileText className="w-4 h-4 text-red-400" />
            </div>
            Xem trước
          </CardTitle>
          <CardDescription>Kết quả đề kiểm tra được tạo bởi AI</CardDescription>
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
                  "Lập kế hoạch câu hỏi…",
                  "Tạo câu hỏi…",
                  "Đánh giá đáp án…",
                  "Kiểm tra độ chính xác…",
                  "Đảm bảo tính đa dạng…",
                  "Tối ưu hóa định dạng…",
                  "Chuẩn bị để hiển thị…",
                ]}
              />
            </div>
          ) : !generatedTest ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 rounded-2xl bg-black/5 border border-border flex items-center justify-center mb-4">
                <FileText className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo đề kiểm tra để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {generatedTest.length} câu hỏi
                  </span>
                  {isNarrow && keyword && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                      {keyword}
                    </span>
                  )}
                </div>
                <DialogAddExam
                  title="Lưu vào đề thi"
                  description="Lưu đề kiểm tra vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                  type={DialogAddExamType.QUIZZ}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-black/5 border-border cursor-pointer"
                  >
                    <SaveAll size={15} className="mr-2" />
                    Lưu
                  </Button>
                </DialogAddExam>
              </div>

              <ScrollArea className="rounded-xl">
                <div className="space-y-3 max-h-[500px] pr-2">
                  {generatedTest.map((q: Quizz, idx: number) => (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-black/5 border border-border hover:border-border transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-lg bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground mb-3">
                            {q.question}
                          </p>
                          <div className="space-y-2">
                            {q.options.map((opt: string, optIdx: number) => {
                              // answer có thể là index (number) hoặc chữ cái (A, B, C, D)
                              const answerIndex =
                                typeof q.answer === "number"
                                  ? q.answer
                                  : ["A", "B", "C", "D"].indexOf(
                                      q.answer.toUpperCase(),
                                    );
                              const isCorrect = answerIndex === optIdx;
                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    "flex items-start gap-2 p-2 rounded-lg transition-colors",
                                    isCorrect
                                      ? "bg-green-500/10 border border-green-500/20"
                                      : "bg-black/5 border border-transparent",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "flex-1 text-sm",
                                      isCorrect
                                        ? "text-green-400"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {opt}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
