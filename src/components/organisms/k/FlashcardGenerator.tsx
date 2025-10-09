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
import {
  SquareSplitVertical,
  ChevronLeft,
  ChevronRight,
  Upload,
  CircleQuestionMark,
  Sparkles,
  Loader2,
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
import AILoadingState from "@/components/kokonutui/ai-loading";
import { FlipCard } from "@/components/atoms/k/FlipCard";

interface Flashcard {
  front: string;
  back: string;
}

interface GeneratedCards {
  cards: Flashcard[];
}

// Mock data generator
const generateMockFlashcards = (
  count: number,
  keyword?: string
): Flashcard[] => {
  const topics = [
    {
      front: "Photosynthesis là gì?",
      back: "Là quá trình mà thực vật sử dụng ánh sáng mặt trời để chuyển đổi CO2 và nước thành glucose và oxy.",
    },
    {
      front: "DNA viết tắt của từ gì?",
      back: "Deoxyribonucleic Acid - Axit Deoxyribonucleic, chứa thông tin di truyền của sinh vật.",
    },
    {
      front: "Định luật Newton thứ nhất là gì?",
      back: "Một vật sẽ giữ nguyên trạng thái đứng yên hoặc chuyển động thẳng đều nếu không có ngoại lực tác dụng.",
    },
    {
      front: "Mitosis là gì?",
      back: "Là quá trình phân chia tế bào nhân thực tạo ra hai tế bào con giống hệt tế bào mẹ.",
    },
    {
      front: "React là gì?",
      back: "Là thư viện JavaScript để xây dựng giao diện người dùng, được phát triển bởi Facebook.",
    },
    {
      front: "Machine Learning là gì?",
      back: "Là nhánh của trí tuệ nhân tạo cho phép máy tính học hỏi từ dữ liệu mà không cần lập trình cụ thể.",
    },
    {
      front: "HTTP viết tắt của gì?",
      back: "HyperText Transfer Protocol - Giao thức truyền tải siêu văn bản.",
    },
    {
      front: "Algorithm là gì?",
      back: "Là một tập hợp các bước hoặc quy tắc được xác định rõ ràng để giải quyết một vấn đề.",
    },
    {
      front: "RESTful API là gì?",
      back: "Là kiến trúc thiết kế API tuân theo các nguyên tắc REST, sử dụng các phương thức HTTP chuẩn.",
    },
    {
      front: "Blockchain là gì?",
      back: "Là công nghệ sổ cái phân tán cho phép lưu trữ dữ liệu an toàn, minh bạch và không thể thay đổi.",
    },
  ];

  const cards: Flashcard[] = [];
  const keywordLower = keyword?.toLowerCase();

  for (let i = 0; i < count; i++) {
    const baseCard = topics[i % topics.length];
    if (keyword && keywordLower) {
      cards.push({
        front: `${baseCard.front} (liên quan đến "${keyword}")`,
        back: `${baseCard.back} Từ khóa: ${keyword}`,
      });
    } else {
      cards.push({ ...baseCard });
    }
  }

  return cards;
};

export function FlashcardGenerator() {
  const [file, setFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [cardCount, setCardCount] = useState([15]);
  const [isNarrow, setIsNarrow] = useState(false);
  const [keyword, setKeyword] = useState("");
  const [generatedCards, setGeneratedCards] = useState<GeneratedCards | null>(
    null
  );
  const [currentCard, setCurrentCard] = useState(0);
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
    setFile(null);
    setGeneratedCards(null);
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
        description: "Vui lòng nhập từ khóa khi sử dụng định dạng thẻ hẹp",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    // Simulate AI generation
    setTimeout(() => {
      const mockCards = generateMockFlashcards(
        cardCount[0],
        isNarrow ? keyword : undefined
      );
      setGeneratedCards({ cards: mockCards });
      setCurrentCard(0);
      setIsGenerating(false);

      toast({
        title: "Tạo flashcard thành công!",
        description: `Đã tạo ${cardCount[0]} thẻ flashcard từ tài liệu của bạn`,
      });
    }, 3000);
  };

  const nextCard = () => {
    if (generatedCards && currentCard < generatedCards.cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Upload & Settings */}
      <Card className="h-fit">
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
                {cardCount[0]} câu
              </span>
            </div>
            <Slider
              value={cardCount}
              onValueChange={setCardCount}
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
      <Card className="border-border bg-card">
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
              <AILoadingState />
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
              {/* Card Counter */}
              <div className="text-center text-sm text-muted-foreground">
                Thẻ {currentCard + 1} / {generatedCards.cards.length}
              </div>

              {/* Flashcard */}
              <FlipCard
                front={{
                  label: "Câu hỏi",
                  content: generatedCards.cards[currentCard].front,
                  hint: "Nhấn để xem câu trả lời",
                }}
                back={{
                  label: "Câu trả lời",
                  content: generatedCards.cards[currentCard].back,
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
                  disabled={currentCard === generatedCards.cards.length - 1}
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
