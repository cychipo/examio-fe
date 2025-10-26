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
import { Loader2, Sparkles, SaveAll } from "lucide-react";
import {
  UploadIcon,
  FileTextIcon,
  QuestionMarkCircledIcon,
} from "@radix-ui/react-icons";
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
import { useScreenBreakpoint } from "@/hooks/useDevices";
import { cn } from "@/lib/utils";
import { Quizz } from "@/types/exam";
import { useTestGeneratorStore } from "@/stores/useAIGeneratorStore";
import {
  DialogAddExam,
  DialogAddExamType,
} from "@/components/organisms/k/DialogAddExam";
import { Item, ItemContent, ItemTitle } from "@/components/ui/item";

export function TestGenerator() {
  const {
    file,
    questionCount,
    isNarrow,
    keyword,
    generatedTest,
    isGenerating,
    setFile,
    setQuestionCount,
    setIsNarrow,
    setKeyword,
    generateTest,
    clearTest,
  } = useTestGeneratorStore();

  const { toast } = useToast();
  const { isMobile } = useScreenBreakpoint();

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
    clearTest();
    toast({
      title: "Đã xóa file",
      description: "Vui lòng tải lên file mới",
    });
  };

  const handleGenerate = async () => {
    await generateTest();
  };
  return (
    <div
      className={cn("gap-6 flex w-full", isMobile ? "flex-col" : "flex-row")}>
      {/* Upload & Settings */}
      <Card
        className={cn(
          "border-border bg-card h-fit",
          isMobile ? "w-full" : "w-2/5"
        )}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="w-5 h-5 text-primary" />
            Tải lên tài liệu
          </CardTitle>
          <CardDescription>
            Tải lên file PDF để AI tạo đề kiểm tra tự động
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload */}
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

          {/* Question Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Số lượng câu hỏi</Label>
              <span className="text-sm font-medium text-primary">
                {questionCount} câu
              </span>
            </div>
            <Slider
              value={[questionCount]}
              onValueChange={(value) => setQuestionCount(value[0])}
              min={5}
              max={50}
              step={5}
              className="w-full"
            />
          </div>

          {/* Narrow Format Toggle */}
          <div className="flex items-center justify-between">
            <Label
              htmlFor="narrow-toggle-test"
              className="flex items-center gap-2 cursor-pointer">
              Định dạng hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <QuestionMarkCircledIcon className="w-4 h-4" />
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
            <div className="space-y-2">
              <Field>
                <FieldLabel htmlFor="keyword-input-test">Từ khóa</FieldLabel>
                <FieldContent>
                  <Input
                    id="keyword-input-test"
                    placeholder="Nhập từ khóa..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                  />
                </FieldContent>
              </Field>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={!file || isGenerating}
            className="w-full h-12 text-base font-medium"
            size="lg">
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
      <Card
        className={cn("border-border bg-card", isMobile ? "w-full" : "w-3/5")}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="w-5 h-5 text-primary" />
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileTextIcon className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo đề kiểm tra để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <h3 className="font-semibold text-lg">
                  {isNarrow && keyword
                    ? `Đề kiểm tra - Chủ đề: ${keyword}`
                    : "Đề kiểm tra được tạo từ AI"}
                </h3>
                <DialogAddExam
                  title="Lưu vào đề thi"
                  description="Lưu đề kiểm tra vào hệ thống để tránh mất dữ liệu và lãng phí thời gian"
                  type={DialogAddExamType.QUIZZ}>
                  <Button variant="outline" size="sm">
                    <SaveAll size={15} className="mr-2" />
                    Lưu
                  </Button>
                </DialogAddExam>
              </div>

              <ScrollArea className=" rounded-md p-2">
                <div className="space-y-4 max-h-[500px]">
                  {generatedTest.map((q: Quizz, idx: number) => (
                    <Item key={idx} variant="outline">
                      <ItemContent>
                        <ItemTitle>
                          {" "}
                          Câu {idx + 1}: {q.question}
                        </ItemTitle>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {q.options.map((opt: string, optIdx: number) => (
                            <div
                              key={optIdx}
                              className="flex items-start gap-2">
                              <span className="font-medium min-w-[20px]">
                                {String.fromCharCode(65 + optIdx)}.
                              </span>
                              <span>{opt}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-xs text-primary font-medium mt-2">
                          Đáp án đúng: {q.answer}
                        </div>
                      </ItemContent>
                    </Item>
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
