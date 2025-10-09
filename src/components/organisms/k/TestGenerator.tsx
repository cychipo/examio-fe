"use client";

import type React from "react";

import { useState } from "react";
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
  Upload,
  FileText,
  Loader2,
  Download,
  Sparkles,
  CircleQuestionMark,
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
import AILoadingState from "@/components/kokonutui/ai-loading";

interface GeneratedTest {
  title: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

// Mock data generator
function generateMockTest(count: number, keyword?: string): GeneratedTest {
  const allQuestions = [
    {
      question: "React được phát triển bởi công ty nào?",
      options: ["Google", "Facebook", "Microsoft", "Apple"],
      correctAnswer: "B",
    },
    {
      question: "HTML viết tắt của gì?",
      options: [
        "HyperText Markup Language",
        "High Tech Modern Language",
        "Home Tool Markup Language",
        "Hyperlinks and Text Markup Language",
      ],
      correctAnswer: "A",
    },
    {
      question: "CSS dùng để làm gì?",
      options: [
        "Xử lý logic",
        "Tạo database",
        "Tạo giao diện",
        "Quản lý server",
      ],
      correctAnswer: "C",
    },
    {
      question: "useState hook trong React dùng để làm gì?",
      options: [
        "Quản lý state trong functional component",
        "Gọi API",
        "Xử lý routing",
        "Tối ưu performance",
      ],
      correctAnswer: "A",
    },
    {
      question: "RESTful API sử dụng phương thức HTTP nào để cập nhật dữ liệu?",
      options: ["GET", "POST", "PUT/PATCH", "DELETE"],
      correctAnswer: "C",
    },
    {
      question: "Virtual DOM trong React là gì?",
      options: [
        "Bản sao nhẹ của DOM thực",
        "DOM của server",
        "DOM của mobile",
        "DOM cũ",
      ],
      correctAnswer: "A",
    },
    {
      question: "Sự khác biệt giữa useMemo và useCallback trong React là gì?",
      options: [
        "useMemo cache giá trị, useCallback cache function",
        "Không có sự khác biệt",
        "useMemo nhanh hơn useCallback",
        "useCallback chỉ dùng cho async",
      ],
      correctAnswer: "A",
    },
    {
      question: "Time complexity của Binary Search là gì?",
      options: ["O(n)", "O(log n)", "O(n²)", "O(1)"],
      correctAnswer: "B",
    },
    {
      question: "SOLID principles có bao nhiêu nguyên tắc?",
      options: ["3", "4", "5", "6"],
      correctAnswer: "C",
    },
    {
      question: "TypeScript là gì?",
      options: [
        "Superset của JavaScript",
        "Framework của JavaScript",
        "Library của JavaScript",
        "Ngôn ngữ khác JavaScript",
      ],
      correctAnswer: "A",
    },
  ];

  const questions = Array.from({ length: count }, (_, i) => {
    const baseQuestion = allQuestions[i % allQuestions.length];
    return {
      id: i + 1,
      question: keyword
        ? `Câu ${i + 1}: ${baseQuestion.question} (liên quan đến "${keyword}")`
        : `Câu ${i + 1}: ${baseQuestion.question}`,
      options: baseQuestion.options,
      correctAnswer: baseQuestion.correctAnswer,
    };
  });

  return {
    title: keyword
      ? `Đề kiểm tra - Chủ đề: ${keyword}`
      : "Đề kiểm tra được tạo từ AI",
    questions,
  };
}

export function TestGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [isNarrow, setIsNarrow] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(
    null,
  );
  const { toast } = useToast();

  const handleFileUpload = (uploadedFile: File) => {
    setFile(uploadedFile);
    toast({
      title: "File đã được tải lên",
      description: `${uploadedFile.name} (${(
        uploadedFile.size
        / 1024
        / 1024
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
    setFile(null);
    setGeneratedTest(null);
    toast({
      title: "Đã xóa file",
      description: "Vui lòng tải lên file mới",
    });
  };

  const handleGenerate = async () => {
    if (!file) {
      toast({
        title: "Chưa có file",
        description: "Vui lòng tải lên file PDF trước",
        variant: "destructive",
      });
      return;
    }

    if (isNarrow && !keyword.trim()) {
      toast({
        title: "Chưa nhập từ khóa",
        description: "Vui lòng nhập từ khóa khi sử dụng định dạng hẹp",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockTest = generateMockTest(
        questionCount[0],
        isNarrow ? keyword : undefined,
      );
      setGeneratedTest(mockTest);
      setIsGenerating(false);
      toast({
        title: "Tạo đề thành công!",
        description: `Đã tạo ${questionCount[0]} câu hỏi từ tài liệu của bạn`,
      });
    }, 3000);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload & Settings */}
      <Card className="border-border bg-card h-fit">
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
          {/* File Upload */}
          {!file
            ? (
                <FileUpload
                  acceptedFileTypes={[".pdf", "application/pdf"]}
                  maxFileSize={10485760}
                  className="w-full h-full"
                  onUploadSuccess={handleFileUpload}
                  onUploadError={handleFileError}
                  uploadDelay={2000}
                />
              )
            : (
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
                {questionCount[0]}
                {" "}
                câu
              </span>
            </div>
            <Slider
              value={questionCount}
              onValueChange={setQuestionCount}
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
              className="flex items-center gap-2 cursor-pointer"
            >
              Định dạng hẹp
              <Tooltip>
                <TooltipTrigger asChild>
                  <CircleQuestionMark size={15} />
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
            size="lg"
          >
            {isGenerating
              ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Đang tạo đề...
                  </>
                )
              : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Tạo đề kiểm tra
                  </>
                )}
          </Button>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Xem trước
          </CardTitle>
          <CardDescription>Kết quả đề kiểm tra được tạo bởi AI</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating
            ? (
                <div className="flex items-center justify-center min-h-[400px]">
                  <AILoadingState />
                </div>
              )
            : !generatedTest
                ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground">
                        Tải lên file PDF và nhấn Tạo đề kiểm tra để xem kết quả
                      </p>
                    </div>
                  )
                : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg">{generatedTest.title}</h3>
                        <Button variant="outline" size="sm">
                          <Download className="w-4 h-4 mr-2" />
                          Tải xuống
                        </Button>
                      </div>

                      <ScrollArea className=" rounded-md border">
                        <div className="space-y-4 max-h-[500px] p-2">
                          {generatedTest.questions.slice(0, 3).map((q) => (
                            <div
                              key={q.id}
                              className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2"
                            >
                              <p className="font-medium text-foreground">
                                {q.question}
                              </p>
                              <div className="space-y-1 text-sm text-muted-foreground">
                                {q.options.map((opt: string, idx: number) => (
                                  <div key={idx}>{opt}</div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {generatedTest.questions.length > 3 && (
                            <p className="text-center text-sm text-muted-foreground">
                              ... và
                              {" "}
                              {generatedTest.questions.length - 3}
                              {" "}
                              câu hỏi khác
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  )}
        </CardContent>
      </Card>
    </div>
  );
}
