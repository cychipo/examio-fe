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
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Upload, FileText, Loader2, Download, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface GeneratedTest {
  title: string;
  questions: {
    id: number;
    question: string;
    options: string[];
    correctAnswer: string;
  }[];
}

export function TestGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState([10]);
  const [difficulty, setDifficulty] = useState("medium");

  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(
    null
  );
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        toast({
          title: "Lỗi định dạng file",
          description: "Vui lòng chỉ tải lên file PDF",
          variant: "destructive",
        });
        return;
      }
      setFile(selectedFile);
      toast({
        title: "File đã được tải lên",
        description: `${selectedFile.name} (${(
          selectedFile.size /
          1024 /
          1024
        ).toFixed(2)} MB)`,
      });
    }
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

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      setGeneratedTest({
        title: "Đề kiểm tra được tạo từ AI",
        questions: Array.from({ length: questionCount[0] }, (_, i) => ({
          id: i + 1,
          question: `Câu hỏi ${
            i + 1
          }: Nội dung câu hỏi sẽ được AI tạo ra dựa trên tài liệu PDF của bạn`,
          options: ["A. Đáp án A", "B. Đáp án B", "C. Đáp án C", "D. Đáp án D"],
          correctAnswer: "A",
        })),
      });
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
      <Card className="border-border bg-card">
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
          <div className="space-y-2">
            <Label htmlFor="pdf-upload">File PDF</Label>
            <div className="relative">
              <Input
                id="pdf-upload"
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
              />
            </div>
            {file && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/10 border border-primary/20">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm text-foreground">{file.name}</span>
              </div>
            )}
          </div>

          {/* Question Count */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>Số lượng câu hỏi</Label>
              <span className="text-sm font-medium text-primary">
                {questionCount[0]} câu
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

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Độ khó</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Xem trước
          </CardTitle>
          <CardDescription>Kết quả đề kiểm tra được tạo bởi AI</CardDescription>
        </CardHeader>
        <CardContent>
          {!generatedTest ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Tải lên file PDF và nhấn Tạo đề kiểm tra để xem kết quả
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">{generatedTest.title}</h3>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Tải xuống
                </Button>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {generatedTest.questions.slice(0, 3).map((q) => (
                  <div
                    key={q.id}
                    className="p-4 rounded-lg bg-secondary/50 border border-border space-y-2">
                    <p className="font-medium text-foreground">{q.question}</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {q.options.map((opt: string, idx: number) => (
                        <div key={idx}>{opt}</div>
                      ))}
                    </div>
                  </div>
                ))}
                {generatedTest.questions.length > 3 && (
                  <p className="text-center text-sm text-muted-foreground">
                    ... và {generatedTest.questions.length - 3} câu hỏi khác
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
