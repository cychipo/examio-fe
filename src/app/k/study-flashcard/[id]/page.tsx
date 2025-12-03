/* eslint-disable react-dom/no-dangerously-set-innerhtml */
"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  BookOpen,
  BarChart3,
  Settings,
  Clock,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashcardStudyPageProps {
  params: Promise<{ id: string }>;
}

type StudyMode = "learn" | "review" | "mixed";

export default function FlashcardStudyPage({
  params,
}: FlashcardStudyPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentFlashcardSet, fetchFlashcardSetById, loading } =
    useFlashcardSetStore();

  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studyMode, setStudyMode] = useState<StudyMode>("learn");
  const [stats, setStats] = useState({
    correctToday: 0,
    incorrectToday: 0,
    timeStudied: 0,
  });
  const [settings, setSettings] = useState({
    autoAdvance: false,
    soundEffects: false,
  });
  const [studiedCards, setStudiedCards] = useState<Set<string>>(
    () => new Set()
  );

  // Fetch flashcard set on mount
  useEffect(() => {
    fetchFlashcardSetById(id);
  }, [id, fetchFlashcardSetById]);

  // Timer for study time
  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        ...prev,
        timeStudied: prev.timeStudied + 1,
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !currentFlashcardSet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải bộ flashcard...</p>
        </div>
      </div>
    );
  }

  const flashcards = currentFlashcardSet.flashcards || [];
  const currentCard = flashcards[currentCardIndex];
  const totalCards = flashcards.length;
  const progressPercentage =
    totalCards > 0 ? (studiedCards.size / totalCards) * 100 : 0;

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleNext = () => {
    if (currentCardIndex < totalCards - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
    }
  };

  const handleCorrect = () => {
    if (!currentCard) return;
    setStats((prev) => ({
      ...prev,
      correctToday: prev.correctToday + 1,
    }));
    setStudiedCards((prev) => new Set([...prev, currentCard.id]));
    handleNext();
  };

  const handleIncorrect = () => {
    if (!currentCard) return;
    setStats((prev) => ({
      ...prev,
      incorrectToday: prev.incorrectToday + 1,
    }));
    setStudiedCards((prev) => new Set([...prev, currentCard.id]));
    handleNext();
  };

  const handleCardClick = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
  };

  const handleExit = () => {
    router.push("/k/flash-card");
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // No flashcards available
  if (totalCards === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có thẻ</h1>
          <p className="text-muted-foreground mb-4">
            Bộ flashcard này chưa có thẻ nào
          </p>
          <Button onClick={handleExit}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // No current card available
  if (!currentCard) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải thẻ...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-7xl mx-auto py-6 px-4">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={handleExit} className="mb-4">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <h1 className="text-2xl font-bold">{currentFlashcardSet.title}</h1>
          <p className="text-muted-foreground">
            {currentFlashcardSet.description}
          </p>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <div className="flex justify-between text-sm mb-2">
            <span>
              Tiến độ: {studiedCards.size}/{totalCards} thẻ
            </span>
            <span>{progressPercentage.toFixed(0)}%</span>
          </div>
          <Progress value={progressPercentage} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Study mode selector */}
            <div className="flex gap-2">
              <Button
                variant={studyMode === "learn" ? "default" : "outline"}
                onClick={() => setStudyMode("learn")}
                size="sm">
                <BookOpen className="h-4 w-4 mr-2" />
                Học thẻ mới
              </Button>
              <Button
                variant={studyMode === "review" ? "default" : "outline"}
                onClick={() => setStudyMode("review")}
                size="sm">
                <RotateCw className="h-4 w-4 mr-2" />
                Ôn tập
              </Button>
              <Button
                variant={studyMode === "mixed" ? "default" : "outline"}
                onClick={() => setStudyMode("mixed")}
                size="sm">
                Học hỗn hợp
              </Button>
            </div>

            {/* Flashcard */}
            <div className="relative" style={{ perspective: "1000px" }}>
              <div
                className={cn(
                  "relative w-full transition-transform duration-500 cursor-pointer",
                  "transform-style-3d"
                )}
                style={{
                  transformStyle: "preserve-3d",
                  transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                  minHeight: "400px",
                }}
                onClick={handleFlip}>
                {/* Front */}
                <Card
                  className={cn(
                    "absolute inset-0 backface-hidden",
                    "flex items-center justify-center p-8"
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    minHeight: "400px",
                  }}>
                  <CardContent className="w-full text-center">
                    <div className="mb-4 text-sm text-muted-foreground">
                      Câu hỏi
                    </div>
                    <div
                      className="prose dark:prose-invert max-w-none text-lg"
                      dangerouslySetInnerHTML={{ __html: currentCard.question }}
                    />
                    <div className="mt-8 text-sm text-muted-foreground">
                      Nhấp để xem câu trả lời
                    </div>
                  </CardContent>
                </Card>

                {/* Back */}
                <Card
                  className={cn(
                    "absolute inset-0 backface-hidden",
                    "flex items-center justify-center p-8 bg-primary/5"
                  )}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    minHeight: "400px",
                  }}>
                  <CardContent className="w-full text-center">
                    <div className="mb-4 text-sm text-muted-foreground">
                      Câu trả lời
                    </div>
                    <div
                      className="prose dark:prose-invert max-w-none text-lg"
                      dangerouslySetInnerHTML={{ __html: currentCard.answer }}
                    />
                    <div className="mt-8 text-sm text-muted-foreground">
                      Nhấp để quay lại câu hỏi
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Card info */}
            <div className="text-center text-sm text-muted-foreground">
              Thẻ {currentCardIndex + 1} / {totalCards}
            </div>

            {/* Navigation buttons */}
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentCardIndex === 0}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Thẻ trước
              </Button>

              {isFlipped && (
                <div className="flex gap-2">
                  <Button variant="destructive" onClick={handleIncorrect}>
                    Chưa nhớ
                  </Button>
                  <Button variant="default" onClick={handleCorrect}>
                    Đã nhớ
                  </Button>
                </div>
              )}

              {!isFlipped && (
                <Button onClick={handleFlip}>Hiện câu trả lời</Button>
              )}

              <Button
                variant="outline"
                onClick={handleNext}
                disabled={currentCardIndex === totalCards - 1}>
                Thẻ sau
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            {/* Stats card */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Thống kê học tập
                </h3>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Đúng hôm nay
                    </span>
                    <span className="font-semibold text-green-600">
                      {stats.correctToday}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Sai hôm nay
                    </span>
                    <span className="font-semibold text-destructive">
                      {stats.incorrectToday}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      Thời gian học
                    </span>
                    <span className="font-semibold">
                      {formatTime(stats.timeStudied)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card list */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4">Danh sách thẻ</h3>

                <div className="grid grid-cols-5 gap-2 max-h-60 overflow-y-auto p-1">
                  {flashcards.map((card, index) => {
                    const isStudied = studiedCards.has(card.id);
                    const isCurrent = index === currentCardIndex;

                    return (
                      <button
                        key={card.id}
                        onClick={() => handleCardClick(index)}
                        className={cn(
                          "aspect-square rounded-md text-sm font-medium transition-colors",
                          isCurrent && "ring-1 ring-primary ring-offset-1",
                          isStudied &&
                            !isCurrent &&
                            "bg-primary text-primary-foreground",
                          !isStudied &&
                            !isCurrent &&
                            "bg-muted hover:bg-muted/80"
                        )}>
                        {index + 1}
                      </button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-4 flex items-center">
                  <Settings className="h-4 w-4 mr-2" />
                  Cài đặt
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-advance" className="text-sm">
                      Tự động chuyển thẻ
                    </Label>
                    <Switch
                      id="auto-advance"
                      checked={settings.autoAdvance}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          autoAdvance: checked,
                        }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="sound-effects" className="text-sm">
                      Hiệu ứng âm thanh
                    </Label>
                    <Switch
                      id="sound-effects"
                      checked={settings.soundEffects}
                      onCheckedChange={(checked) =>
                        setSettings((prev) => ({
                          ...prev,
                          soundEffects: checked,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
