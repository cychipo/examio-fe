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
import { Label } from "@/components/ui/label";
import ModelSelector from "@/components/atoms/ModelSelector";
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
import ModernLoader from "@/components/ui/modern-loader";
import { Quizz } from "@/types/exam";
import { useTestGeneratorStore } from "@/stores/useAIGeneratorStore";
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
    clearTest();
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
          toast.warning("File PDF quá lớn", {
            description: `File có ${pageCount} trang. Giới hạn tối đa là 50 trang.`,
          });
          return;
        }
      } catch {
        // Ignored
      }
    }

    await generateTest();
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
            Tải lên file PDF để AI tạo đề kiểm tra tự động
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
              <Label className="text-muted-foreground">Số lượng câu hỏi</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={questionCount}
                  onChange={(e) => {
                    const val = Number.parseInt(e.target.value);
                    if (!Number.isNaN(val)) setQuestionCount(val);
                  }}
                  className="h-8 w-16 border-none bg-primary/10 px-1 text-center text-xs font-bold focus-visible:ring-1 focus-visible:ring-primary/30"
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
            <p className="text-[10px] italic text-muted-foreground">
              * Tối đa 100 câu hỏi.
            </p>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-black/5 p-3">
            <Label
              htmlFor="narrow-toggle-test"
              className="flex cursor-pointer items-center gap-2 text-muted-foreground"
            >
              Định dạng hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleHelp className="h-4 w-4 text-muted-foreground/60" />
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
              className="cursor-pointer data-[state=checked]:bg-primary"
            />
          </div>

          {isNarrow && (
            <div className="animate-in slide-in-from-top-2 space-y-2 duration-200">
              <Field>
                <FieldLabel htmlFor="keyword-input-test">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input-test"
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
                Đang tạo đề...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" />
                Tạo đề kiểm tra
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
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-primary/20 bg-gradient-to-br from-primary/20 to-primary/5">
                  <FileText className="h-4 w-4 text-red-400" />
                </div>
                Kết quả đề kiểm tra
              </CardTitle>
              <CardDescription>
                Xem, rà soát và lưu bộ câu hỏi được tạo từ tài liệu của bạn.
              </CardDescription>
            </div>

            {generatedTest && !isGenerating && (
              <DialogAddExam
                title="Lưu vào đề thi"
                description="Lưu đề kiểm tra vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                type={DialogAddExamType.QUIZZ}
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

          {generatedTest && !isGenerating && (
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="rounded-full border border-border bg-black/5 px-3 py-1 font-medium text-foreground">
                {generatedTest.length} câu hỏi
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
            <div className="flex min-h-[420px] flex-1 flex-col items-center justify-center rounded-[28px] border border-dashed border-border/70 bg-black/[0.03] px-6 text-center">
              <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-black/5">
                <FileText className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <p className="max-w-md text-sm text-muted-foreground md:text-base">
                Tải lên file PDF và nhấn Tạo đề kiểm tra để xem kết quả.
              </p>
            </div>
          ) : (
            <ScrollArea className="flex-1 min-h-[420px] rounded-[28px] border border-border/60 bg-black/[0.04]">
              <div className="space-y-4 p-4 pr-5 md:p-6 md:pr-7 max-h-[500px] overflow-y-auto">
                {generatedTest.map((q: Quizz, idx: number) => {
                  const answerIndex =
                    typeof q.answer === "number"
                      ? q.answer
                      : ["A", "B", "C", "D"].indexOf(q.answer.toUpperCase());

                  return (
                    <div
                      key={idx}
                      className="rounded-2xl border border-border/60 bg-background/20 p-4 md:p-5"
                    >
                      <div className="flex items-start gap-4">
                        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-sm font-semibold text-primary">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1 space-y-4">
                          <p className="text-sm font-semibold leading-7 text-foreground md:text-base">
                            {q.question}
                          </p>

                          <div className="grid gap-2.5">
                            {q.options.map((opt: string, optIdx: number) => {
                              const isCorrect = answerIndex === optIdx;

                              return (
                                <div
                                  key={optIdx}
                                  className={cn(
                                    "flex items-start gap-3 rounded-xl border p-3 transition-colors",
                                    isCorrect
                                      ? "border-green-500/20 bg-green-500/10"
                                      : "border-border/50 bg-black/5",
                                  )}
                                >
                                  <span
                                    className={cn(
                                      "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-semibold",
                                      isCorrect
                                        ? "bg-green-500/15 text-green-400"
                                        : "bg-black/10 text-muted-foreground",
                                    )}
                                  >
                                    {String.fromCharCode(65 + optIdx)}
                                  </span>
                                  <span
                                    className={cn(
                                      "flex-1 text-sm leading-6",
                                      isCorrect
                                        ? "text-green-400"
                                        : "text-muted-foreground",
                                    )}
                                  >
                                    {opt}
                                  </span>
                                  {isCorrect && (
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
