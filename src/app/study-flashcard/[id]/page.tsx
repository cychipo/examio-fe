/* eslint-disable react-dom/no-dangerously-set-innerhtml */
"use client";

import { useRouter } from "next/navigation";
import { use, useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  Lock,
  Volume2,
  VolumeX,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  checkFlashcardSetAccess,
  getFlashcardSetPublicInfo,
  getFlashcardSetForStudy,
} from "@/apis/flashcardSetApi";
import type {
  FlashcardSetPublicInfo,
  AccessCheckResult,
  Flashcard,
} from "@/types/flashcardSet";

interface FlashcardStudyPageProps {
  params: Promise<{ id: string }>;
}

// Sound effects URLs
const SOUND_EFFECTS = {
  flip: "https://cdn.pixabay.com/audio/2022/03/10/audio_71e4fc8a6e.mp3",
  next: "https://cdn.pixabay.com/audio/2025/11/06/audio_69d4c569ef.mp3",
  prev: "https://cdn.pixabay.com/audio/2025/11/06/audio_69d4c569ef.mp3",
};

export default function FlashcardStudyPage({
  params,
}: FlashcardStudyPageProps) {
  const { id } = use(params);
  const router = useRouter();

  // Access states
  const [accessCheckResult, setAccessCheckResult] =
    useState<AccessCheckResult | null>(null);
  const [publicInfo, setPublicInfo] = useState<FlashcardSetPublicInfo | null>(
    null,
  );
  const [accessCode, setAccessCode] = useState("");
  const [accessError, setAccessError] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false);

  // Loading states
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);

  // Flashcard states
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [flashcardSetTitle, setFlashcardSetTitle] = useState("");
  const [flashcardSetDescription, setFlashcardSetDescription] = useState("");
  const [viewCount, setViewCount] = useState(0);
  const [creator, setCreator] = useState<{
    name: string;
    avatar: string | null;
    username: string;
  } | null>(null);

  // Study states
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studiedCards, setStudiedCards] = useState<Set<string>>(
    () => new Set(),
  );
  const [settings, setSettings] = useState({
    soundEffects: false,
  });

  // Audio refs
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to current card
  useEffect(() => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const activeButton = container.children[currentCardIndex] as HTMLElement;

      if (activeButton) {
        const containerRect = container.getBoundingClientRect();
        const buttonRect = activeButton.getBoundingClientRect();

        const scrollLeft =
          container.scrollLeft +
          (buttonRect.left - containerRect.left) -
          container.offsetWidth / 2 +
          activeButton.offsetWidth / 2;

        container.scrollTo({
          left: scrollLeft,
          behavior: "smooth",
        });
      }
    }
  }, [currentCardIndex]);

  // Play sound effect
  const playSound = useCallback(
    (sound: keyof typeof SOUND_EFFECTS) => {
      if (settings.soundEffects && audioRef.current) {
        audioRef.current.src = SOUND_EFFECTS[sound];
        audioRef.current.play().catch(() => {
          // Ignore errors if sound can't play
        });
      }
    },
    [settings.soundEffects],
  );

  // Load flashcards function
  const loadFlashcards = useCallback(
    async (flashcardId: string, code?: string) => {
      setIsLoadingFlashcards(true);
      try {
        const data = await getFlashcardSetForStudy(flashcardId, code);
        setFlashcards(data.flashCards || []);
        setFlashcardSetTitle(data.title);
        setFlashcardSetDescription(data.description || "");
        setViewCount(data.viewCount);
        setCreator(data.creator);
        setShowAccessModal(false);
        setAccessCheckResult({
          hasAccess: true,
          requiresCode: false,
          accessType: "public",
        });
      } catch (error) {
        console.error("Error loading flashcards:", error);
        throw error;
      } finally {
        setIsLoadingFlashcards(false);
      }
    },
    [],
  );

  // Check access on mount
  useEffect(() => {
    const checkAccess = async () => {
      setIsCheckingAccess(true);
      try {
        const result = await checkFlashcardSetAccess(id);
        setAccessCheckResult(result);

        if (result.hasAccess) {
          // User has access, load flashcards
          await loadFlashcards(id);
        } else if (result.requiresCode) {
          // Need to show access code modal
          const info = await getFlashcardSetPublicInfo(id);
          setPublicInfo(info);
          setShowAccessModal(true);
        } else {
          // No access at all
          const info = await getFlashcardSetPublicInfo(id);
          setPublicInfo(info);
        }
      } catch (error) {
        console.error("Error checking access:", error);
        // Try to get public info
        try {
          const info = await getFlashcardSetPublicInfo(id);
          setPublicInfo(info);
        } catch {
          // Flashcard set doesn't exist
        }
      } finally {
        setIsCheckingAccess(false);
      }
    };

    checkAccess();
  }, [id, loadFlashcards]);

  const handleVerifyCode = async () => {
    if (!accessCode.trim()) {
      setAccessError("Vui lòng nhập mã truy cập");
      return;
    }

    setIsVerifying(true);
    setAccessError("");

    try {
      await loadFlashcards(id, accessCode);
    } catch (error: any) {
      setAccessError(error?.message || "Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    playSound("flip");
  };

  const handlePrevious = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
      setIsFlipped(false);
      playSound("prev");
    }
  };

  const handleNext = () => {
    if (currentCardIndex < flashcards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setIsFlipped(false);
      playSound("next");

      // Mark card as studied
      const currentCard = flashcards[currentCardIndex];
      if (currentCard) {
        setStudiedCards((prev) => new Set([...prev, currentCard.id]));
      }
    }
  };

  const handleCardClick = (index: number) => {
    setCurrentCardIndex(index);
    setIsFlipped(false);
    playSound("next");
  };

  // Loading state
  if (isCheckingAccess) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  // No access - show error
  if (
    accessCheckResult &&
    !accessCheckResult.hasAccess &&
    !accessCheckResult.requiresCode
  ) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center max-w-md px-4">
          <Lock className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có quyền truy cập</h1>
          <p className="text-muted-foreground mb-4">
            Bạn không có quyền xem bộ flashcard này. Bộ flashcard có thể là
            riêng tư hoặc bạn chưa được thêm vào whitelist.
          </p>
          {publicInfo && (
            <div className="p-4 bg-muted rounded-lg mb-4 text-center">
              <p className="font-medium">{publicInfo.title}</p>
              <p className="text-sm text-muted-foreground">
                Tạo bởi{" "}
                <span className="font-semibold">
                  {publicInfo.creator.name || publicInfo.creator.username}
                </span>
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Access code modal
  if (showAccessModal) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <Dialog open={showAccessModal} onOpenChange={setShowAccessModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Yêu cầu mã truy cập
              </DialogTitle>
              <DialogDescription>
                Bộ flashcard này yêu cầu mã truy cập để xem
              </DialogDescription>
            </DialogHeader>

            {publicInfo && (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="font-medium">{publicInfo.title}</p>
                <p className="text-sm text-muted-foreground">
                  Tạo bởi{" "}
                  <span className="font-semibold">
                    {publicInfo.creator.name || publicInfo.creator.username}
                  </span>
                </p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="access-code">Mã truy cập (6 ký tự)</Label>
                <Input
                  id="access-code"
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                  placeholder="XXXXXX"
                  maxLength={6}
                  className="text-center text-lg tracking-widest font-mono"
                />
                {accessError && (
                  <p className="text-sm text-destructive">{accessError}</p>
                )}
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button onClick={handleVerifyCode} disabled={isVerifying}>
                {isVerifying ? "Đang xác nhận..." : "Xác nhận"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Loading flashcards
  if (isLoadingFlashcards) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải bộ flashcard...</p>
        </div>
      </div>
    );
  }

  // No flashcards
  if (flashcards.length === 0) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="text-center">
          <X className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có thẻ</h1>
          <p className="text-muted-foreground mb-4">
            Bộ flashcard này chưa có thẻ nào
          </p>
        </div>
      </div>
    );
  }

  const currentCard = flashcards[currentCardIndex];
  const totalCards = flashcards.length;

  return (
    <div className="fixed inset-0 bg-background overflow-hidden">
      {/* Audio element for sound effects */}
      <audio ref={audioRef} />

      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-background/95 backdrop-blur border-b">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Left: Close button & Title */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/")}
              className="shrink-0"
            >
              <Home className="h-5 w-5" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-lg font-bold truncate">
                {flashcardSetTitle}
              </h1>
              {flashcardSetDescription && (
                <p className="text-sm text-muted-foreground truncate">
                  {flashcardSetDescription}
                </p>
              )}
            </div>
          </div>

          {/* Right: Creator info, Views, Settings */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Creator info */}
            {creator && (
              <div className="hidden sm:flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator.avatar || "/avt-default.webp"} />
                </Avatar>
                <span className="text-sm text-muted-foreground">
                  {creator.name || creator.username}
                </span>
              </div>
            )}

            {/* View count */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{viewCount.toLocaleString()}</span>
            </div>

            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  soundEffects: !prev.soundEffects,
                }))
              }
              className={cn(
                settings.soundEffects
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {settings.soundEffects ? (
                <Volume2 className="h-5 w-5" />
              ) : (
                <VolumeX className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex items-center justify-center h-full pt-16 pb-20 px-4">
        <div className="w-full max-w-4xl">
          {/* Flashcard */}
          <div className="relative" style={{ perspective: "1000px" }}>
            <div
              className={cn(
                "relative w-full transition-transform duration-500 cursor-pointer",
              )}
              style={{
                transformStyle: "preserve-3d",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
                minHeight: "400px",
              }}
              onClick={handleFlip}
            >
              {/* Front */}
              <Card
                className={cn(
                  "absolute inset-0",
                  "flex items-center justify-center p-8",
                )}
                style={{
                  backfaceVisibility: "hidden",
                  minHeight: "400px",
                }}
              >
                <CardContent className="w-full text-center">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Câu hỏi
                  </div>
                  <div
                    className="prose max-w-none text-lg"
                    dangerouslySetInnerHTML={{
                      __html: currentCard?.question || "",
                    }}
                  />
                  <div className="mt-8 text-sm text-muted-foreground">
                    Nhấp để xem câu trả lời
                  </div>
                </CardContent>
              </Card>

              {/* Back */}
              <Card
                className={cn(
                  "absolute inset-0",
                  "flex items-center justify-center p-8 bg-primary/5",
                )}
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                  minHeight: "400px",
                }}
              >
                <CardContent className="w-full text-center">
                  <div className="mb-4 text-sm text-muted-foreground">
                    Câu trả lời
                  </div>
                  <div
                    className="prose max-w-none text-lg"
                    dangerouslySetInnerHTML={{
                      __html: currentCard?.answer || "",
                    }}
                  />
                  <div className="mt-8 text-sm text-muted-foreground">
                    Nhấp để quay lại câu hỏi
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-background/95 backdrop-blur border-t">
        <div className="flex items-center justify-between px-4 py-3 max-w-7xl mx-auto">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentCardIndex === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Thẻ trước
          </Button>

          {/* Card indicator with mini cards */}
          <div className="flex items-center gap-3">
            <div
              ref={scrollContainerRef}
              className="hidden sm:flex gap-1 max-w-xs overflow-x-auto no-scrollbar scroll-smooth [&::-webkit-scrollbar]:h-1"
            >
              {flashcards.map((card, index) => {
                const isStudied = studiedCards.has(card.id);
                const isCurrent = index === currentCardIndex;

                return (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(index)}
                    className={cn(
                      "w-10 h-10 rounded text-xs font-medium transition-colors shrink-0",
                      isCurrent && "border border-border",
                      isStudied &&
                        !isCurrent &&
                        "bg-primary text-primary-foreground",
                      !isStudied && !isCurrent && "bg-muted hover:bg-muted/80",
                    )}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>

            {/* Card counter */}
            <div className="text-sm text-muted-foreground">
              <span className="font-semibold">{currentCardIndex + 1}</span>
              <span> / {totalCards}</span>
            </div>
          </div>

          {/* Next button */}
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentCardIndex === totalCards - 1}
          >
            Thẻ sau
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
