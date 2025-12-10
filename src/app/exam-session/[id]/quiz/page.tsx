/* eslint-disable react-dom/no-dangerously-set-innerhtml */
"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  ChevronLeft,
  ChevronRight,
  Flag,
  CheckCircle2,
  XCircle,
  BarChart3,
  Clock,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import { FullscreenConfirmDialog } from "@/components/organisms/FullscreenConfirmDialog";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/useDebounce";
import { useCheatingDetection } from "@/hooks/useCheatingDetection";
import { CheatingWarningModal } from "@/components/molecules/CheatingWarningModal";
import { StandardMarkdownRenderer } from "@/components/molecules/StandardMarkdownRenderer";
import {
  startExamAttemptApi,
  updateExamAttemptProgressApi,
  Question,
} from "@/apis/examAttemptApi";
import {
  DecryptedQuestion,
  QuestionTokenMap,
  fetchAndDecryptSecureQuiz,
  submitSecureQuiz,
} from "@/lib/secureQuizHelpers";

interface ExamQuizPageProps {
  params: Promise<{ id: string }>;
}

export default function ExamQuizPage({ params }: ExamQuizPageProps) {
  const { id: examSessionId } = use(params);
  const router = useRouter();

  // Fullscreen confirmation state
  const [showFullscreenDialog, setShowFullscreenDialog] = useState(true);
  const [fullscreenConfirmed, setFullscreenConfirmed] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);

  // Attempt state
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<DecryptedQuestion[]>([]);
  const [tokenMap, setTokenMap] = useState<QuestionTokenMap>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [examSessionData, setExamSessionData] = useState<{
    allowRetake: boolean;
    showAnswersAfterSubmit: boolean;
    examRoomTitle: string;
  } | null>(null);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    () => new Set()
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  // Result state
  const [resultData, setResultData] = useState<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    showAnswers: boolean;
    passed: boolean;
    passingScore: number;
    questions?: Question[];
  } | null>(null);

  // Timer state
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasWarned30s, setHasWarned30s] = useState(false);

  // Debounce for auto-save
  const debouncedAnswers = useDebounce(answers, 1000);
  const debouncedCurrentIndex = useDebounce(currentQuestionIndex, 1000);

  // Cheating detection
  const cheatingDetection = useCheatingDetection({
    examAttemptId: attemptId || "",
    enabled: !!attemptId && !isSubmitted && !loading,
  });

  // Save progress callback
  const saveProgress = useCallback(
    async (overrideAnswers?: Record<string, string>) => {
      if (!attemptId || isSubmitted) return;

      const answersToSave = overrideAnswers ?? answers;

      try {
        await updateExamAttemptProgressApi(attemptId, {
          answers: answersToSave,
          currentIndex: currentQuestionIndex,
          markedQuestions: Array.from(markedForReview),
        });
      } catch (err) {
        console.error("Failed to save progress:", err);
      }
    },
    [attemptId, answers, currentQuestionIndex, markedForReview, isSubmitted]
  );

  // Auto submit when time is up
  const handleAutoSubmit = useCallback(async () => {
    if (!attemptId || tokenMap.size === 0) return;

    try {
      // Save progress first
      await updateExamAttemptProgressApi(attemptId, {
        answers,
        currentIndex: currentQuestionIndex,
        markedQuestions: Array.from(markedForReview),
      });

      // Submit with secure tokens
      const result = await submitSecureQuiz(attemptId, answers, tokenMap);
      setResultData({
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        percentage: result.percentage,
        showAnswers: result.showAnswers,
        passed: result.passed,
        passingScore: result.passingScore,
        questions: result.questions,
      });
      setIsSubmitted(true);
      toast.info("Đã hết thời gian", {
        description: "Bài thi đã được tự động nộp",
      });
    } catch (err) {
      console.error("Failed to auto-submit:", err);
    }
  }, [attemptId, answers, currentQuestionIndex, markedForReview, tokenMap]);

  // Initialize exam attempt
  useEffect(() => {
    // Don't load exam until fullscreen is confirmed
    if (!fullscreenConfirmed) return;

    const initExam = async () => {
      setLoading(true);
      setError(null);

      try {
        // Start or resume attempt
        // Access token from state if needed, though here we rely on the flow
        const startResult = await startExamAttemptApi(
          examSessionId,
          captchaToken || undefined
        );
        setAttemptId(startResult.examAttempt.id);

        // Get secure quiz data with encrypted questions
        const secureQuizData = await fetchAndDecryptSecureQuiz(
          startResult.examAttempt.id
        );

        // Store decrypted questions and token map
        setQuestions(secureQuizData.questions);
        setTokenMap(secureQuizData.tokenMap);

        // Always restore answers from attempt data (persisted in DB)
        // Convert old answers format (using real questionId) to new format (using q_index)
        const savedAnswers = secureQuizData.savedAnswers || {};
        setAnswers(savedAnswers);
        setCurrentQuestionIndex(secureQuizData.currentIndex || 0);
        setMarkedForReview(new Set(secureQuizData.markedQuestions || []));

        // Calculate elapsed time from startedAt
        if (secureQuizData.startedAt) {
          const startedAtDate = new Date(secureQuizData.startedAt);
          const now = new Date();
          const elapsedSeconds = Math.floor(
            (now.getTime() - startedAtDate.getTime()) / 1000
          );
          setTimeSpentSeconds(Math.max(0, elapsedSeconds));
        }

        // Show toast if resuming with saved data
        if (startResult.isResume && Object.keys(savedAnswers).length > 0) {
          toast.info("Tiếp tục làm bài", {
            description: "Dữ liệu của bạn đã được khôi phục",
          });
        }

        // Set time limit
        setTimeLimitMinutes(secureQuizData.timeLimitMinutes);

        // Check if already submitted
        if (secureQuizData.status === 1) {
          // COMPLETED
          setIsSubmitted(true);
          setResultData({
            score: 0, // Will be updated by viewing results
            totalQuestions: secureQuizData.totalQuestions,
            correctAnswers: 0,
            percentage: 0,
            showAnswers: false,
            passed: false,
            passingScore: 0,
            questions: undefined,
          });
        }
      } catch (err: any) {
        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Không thể bắt đầu bài thi";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    initExam();
  }, [examSessionId, fullscreenConfirmed, captchaToken]);

  // Handle fullscreen dialog
  const handleFullscreenConfirm = (token?: string) => {
    if (token) {
      setCaptchaToken(token);
    }
    setShowFullscreenDialog(false);
    setFullscreenConfirmed(true);
  };

  const handleFullscreenCancel = () => {
    // Navigate back to exam session page
    router.push(`/exam-session/${examSessionId}`);
  };

  // Cleanup fullscreen protections on unmount
  useEffect(() => {
    return () => {
      const cleanupFns = (window as any).__examCleanupFunctions;
      if (cleanupFns) {
        document.removeEventListener("keydown", cleanupFns.preventDevTools);
        document.removeEventListener(
          "contextmenu",
          cleanupFns.preventRightClick
        );
      }
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Timer effect
  useEffect(() => {
    if (!loading && !isSubmitted && questions.length > 0) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [loading, isSubmitted, questions.length]);

  // Check time limit and auto-submit
  useEffect(() => {
    if (timeLimitMinutes && !loading && !isSubmitted) {
      const timeLimitSeconds = timeLimitMinutes * 60;
      const remainingSeconds = timeLimitSeconds - timeSpentSeconds;

      // Warning at 30 seconds
      if (remainingSeconds <= 30 && remainingSeconds > 0 && !hasWarned30s) {
        setHasWarned30s(true);
        toast.warning("Sắp hết thời gian!", {
          description: "Còn 30 giây nữa sẽ tự động nộp bài",
        });
      }

      // Auto-submit when time is up
      if (remainingSeconds <= 0) {
        handleAutoSubmit();
      }
    }
  }, [
    timeSpentSeconds,
    timeLimitMinutes,
    loading,
    isSubmitted,
    hasWarned30s,
    handleAutoSubmit,
  ]);

  // Auto-save effect
  useEffect(() => {
    if (attemptId && !loading && !isSubmitted) {
      saveProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAnswers, debouncedCurrentIndex]);

  // Save progress before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (attemptId && !isSubmitted) {
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/examattempts/${attemptId}/progress`,
          JSON.stringify({
            answers,
            currentIndex: currentQuestionIndex,
            markedQuestions: Array.from(markedForReview),
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [attemptId, isSubmitted, answers, currentQuestionIndex, markedForReview]);

  // Computed values
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const getRemainingTime = () => {
    if (!timeLimitMinutes) return null;
    const remaining = timeLimitMinutes * 60 - timeSpentSeconds;
    return Math.max(0, remaining);
  };

  // Handlers
  const handleAnswerSelect = (answer: string) => {
    if (!currentQuestion) return;
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: answer,
    }));
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    setMarkedForReview((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(currentQuestion.id)) {
        newSet.delete(currentQuestion.id);
      } else {
        newSet.add(currentQuestion.id);
      }
      return newSet;
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const doSubmit = async () => {
    if (!attemptId || tokenMap.size === 0) return;

    try {
      // Save progress first
      await saveProgress(answers);

      // Submit with secure tokens
      const result = await submitSecureQuiz(attemptId, answers, tokenMap);
      setResultData({
        score: result.score,
        totalQuestions: result.totalQuestions,
        correctAnswers: result.correctAnswers,
        percentage: result.percentage,
        showAnswers: result.showAnswers,
        passed: result.passed,
        passingScore: result.passingScore,
        questions: result.questions,
      });
      setIsSubmitted(true);
      setShowSubmitConfirm(false);
      toast.success("Nộp bài thành công!");
    } catch (err: any) {
      const message =
        err?.response?.data?.message || err?.message || "Nộp bài thất bại";
      toast.error(message);
    }
  };

  const handleSubmitClick = () => {
    if (answeredCount < totalQuestions) {
      setShowSubmitConfirm(true);
    } else {
      doSubmit();
    }
  };

  const handleQuestionClick = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleViewDetails = () => {
    setShowDetailedResults(true);
    setReviewQuestionIndex(0);
  };

  const handleBackToSummary = () => {
    setShowDetailedResults(false);
  };

  const handleReviewPrevious = () => {
    if (reviewQuestionIndex > 0) {
      setReviewQuestionIndex(reviewQuestionIndex - 1);
    }
  };

  const handleReviewNext = () => {
    if (reviewQuestionIndex < totalQuestions - 1) {
      setReviewQuestionIndex(reviewQuestionIndex + 1);
    }
  };

  const handleReviewQuestionClick = (index: number) => {
    setReviewQuestionIndex(index);
  };

  const handleExit = () => {
    router.push(`/exam-session/${examSessionId}`);
  };

  const handleRetry = async () => {
    // Reload the page to start fresh
    window.location.reload();
  };

  // Loading state
  if (loading || !fullscreenConfirmed) {
    return (
      <>
        {/* Fullscreen Confirmation Dialog */}
        <FullscreenConfirmDialog
          open={showFullscreenDialog}
          onConfirm={handleFullscreenConfirm}
          onCancel={handleFullscreenCancel}
        />

        {fullscreenConfirmed && (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Đang tải bài thi...</p>
            </div>
          </div>
        )}
      </>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không thể tải bài thi</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push(`/exam-session/${examSessionId}`)}>
            Quay lại
          </Button>
        </div>
      </div>
    );
  }

  // No questions
  if (totalQuestions === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có câu hỏi</h1>
          <p className="text-muted-foreground mb-4">
            Bài thi này chưa có câu hỏi nào
          </p>
          <Button onClick={handleExit}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // Results view
  if (isSubmitted && resultData) {
    const correctAnswersCount = resultData.correctAnswers;
    const percentage = resultData.percentage;
    const passed = resultData.passed;
    const _passingScore = resultData.passingScore;

    // Detailed results view
    if (showDetailedResults && resultData.showAnswers && resultData.questions) {
      const reviewQuestion = resultData.questions[reviewQuestionIndex];
      const userAnswer = answers[reviewQuestion.id];
      const isCorrect = userAnswer === reviewQuestion.answer;

      return (
        <div className="min-h-screen">
          <div className="container max-w-7xl mx-auto py-6 px-4">
            <div className="mb-6">
              <Button
                variant="ghost"
                onClick={handleBackToSummary}
                className="mb-4">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Quay lại tổng quan
              </Button>
              <h1 className="text-2xl font-bold">Xem lại kết quả</h1>
              <p className="text-muted-foreground">
                Bài thi - Câu {reviewQuestionIndex + 1}/{totalQuestions}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className="lg:col-span-3 space-y-6">
                <Card
                  className={cn(
                    "border-2",
                    isCorrect ? "border-green-500" : "border-destructive"
                  )}>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          Câu {reviewQuestionIndex + 1}/{totalQuestions}
                        </h2>
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-green-600 text-sm font-medium">
                            <CheckCircle2 className="h-4 w-4" />
                            Đúng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-destructive text-sm font-medium">
                            <XCircle className="h-4 w-4" />
                            Sai
                          </span>
                        )}
                      </div>
                    </div>

                    <div
                      className="prose dark:prose-invert max-w-none mb-6"
                      dangerouslySetInnerHTML={{
                        __html: reviewQuestion.question,
                      }}
                    />

                    <div className="space-y-3">
                      {reviewQuestion.options.map((option, index) => {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isUserAnswer = userAnswer === optionLetter;
                        const isCorrectAnswer =
                          reviewQuestion.answer === optionLetter;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors",
                              isCorrectAnswer &&
                                "border-green-500 bg-green-50 dark:bg-green-950/20",
                              isUserAnswer &&
                                !isCorrectAnswer &&
                                "border-destructive bg-red-50 dark:bg-red-950/20",
                              !isUserAnswer &&
                                !isCorrectAnswer &&
                                "border-border"
                            )}>
                            <div className="flex-shrink-0 mt-0.5">
                              {isCorrectAnswer ? (
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                              ) : isUserAnswer ? (
                                <XCircle className="h-5 w-5 text-destructive" />
                              ) : (
                                <div className="h-5 w-5 rounded-full border-2 border-muted-foreground/30" />
                              )}
                            </div>
                            <div className="flex-1">
                              <span
                                dangerouslySetInnerHTML={{ __html: option }}
                              />
                              {isCorrectAnswer && (
                                <span className="ml-2 text-green-600 text-sm font-medium">
                                  (Đáp án đúng)
                                </span>
                              )}
                              {isUserAnswer && !isCorrectAnswer && (
                                <span className="ml-2 text-destructive text-sm font-medium">
                                  (Bạn chọn)
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!userAnswer && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                          Bạn không trả lời câu hỏi này
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <div className="flex justify-between">
                  <Button
                    variant="outline"
                    onClick={handleReviewPrevious}
                    disabled={reviewQuestionIndex === 0}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Câu trước
                  </Button>

                  <Button
                    variant="outline"
                    onClick={handleReviewNext}
                    disabled={reviewQuestionIndex === totalQuestions - 1}>
                    Câu sau
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </div>

              <div className="lg:col-span-1">
                <Card className="sticky top-6">
                  <CardContent className="pt-6">
                    <h3 className="font-semibold mb-4 flex items-center">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Danh sách câu hỏi
                    </h3>

                    <div className="grid grid-cols-5 gap-2 p-1">
                      {resultData.questions.map((q, index) => {
                        const qUserAnswer = answers[q.id];
                        const qIsCorrect = qUserAnswer === q.answer;
                        const isCurrent = index === reviewQuestionIndex;

                        return (
                          <button
                            key={q.id}
                            onClick={() => handleReviewQuestionClick(index)}
                            className={cn(
                              "aspect-square rounded-md text-sm font-medium transition-colors",
                              isCurrent && "ring-1 ring-primary ring-offset-1",
                              qIsCorrect && "bg-green-500 text-white",
                              !qIsCorrect &&
                                qUserAnswer &&
                                "bg-destructive text-white",
                              !qUserAnswer && "bg-yellow-500 text-white"
                            )}>
                            {index + 1}
                          </button>
                        );
                      })}
                    </div>

                    <div className="mt-6 space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded" />
                        <span>Đúng ({correctAnswersCount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-destructive rounded" />
                        <span>
                          Sai (
                          {totalQuestions -
                            correctAnswersCount -
                            (totalQuestions - answeredCount)}
                          )
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-yellow-500 rounded" />
                        <span>
                          Chưa trả lời ({totalQuestions - answeredCount})
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleBackToSummary}>
                        Xem tổng quan
                      </Button>
                      {true && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={handleRetry}>
                          Làm lại
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Summary results view
    return (
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                {passed ? (
                  <CheckCircle2 className="h-20 w-20 text-green-500" />
                ) : (
                  <XCircle className="h-20 w-20 text-destructive" />
                )}
              </div>

              <div>
                <h1 className="text-3xl font-bold mb-2">
                  {passed ? "Chúc mừng!" : "Chưa đạt"}
                </h1>
                <p className="text-muted-foreground">
                  {passed
                    ? "Bạn đã hoàn thành bài thi"
                    : "Hãy cố gắng hơn lần sau"}
                </p>
              </div>

              <div className="grid grid-cols-5 gap-4 max-w-2xl mx-auto">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {correctAnswersCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Đúng</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {totalQuestions - correctAnswersCount}
                  </div>
                  <div className="text-sm text-muted-foreground">Sai</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Điểm</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {formatTime(timeSpentSeconds)}
                  </div>
                  <div className="text-sm text-muted-foreground">Thời gian</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div
                    className={`text-2xl font-bold ${
                      cheatingDetection.totalViolations > 0
                        ? "text-orange-500"
                        : "text-green-600"
                    }`}>
                    {cheatingDetection.totalViolations}
                  </div>
                  <div className="text-sm text-muted-foreground">Vi phạm</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                {resultData.showAnswers && resultData.questions && (
                  <Button onClick={handleViewDetails} variant="default">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Xem chi tiết
                  </Button>
                )}
                {true && (
                  <Button onClick={handleRetry} variant="outline">
                    Làm lại
                  </Button>
                )}
                <Button onClick={handleExit} variant="outline">
                  Thoát
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Quiz view
  const remainingTime = getRemainingTime();

  return (
    <>
      <ConfirmDialog
        open={showSubmitConfirm}
        onOpenChange={setShowSubmitConfirm}
        title="Xác nhận nộp bài"
        description={`Bạn mới trả lời ${answeredCount}/${totalQuestions} câu hỏi. Bạn có chắc muốn nộp bài?`}
        confirmText="Nộp bài"
        cancelText="Tiếp tục làm"
        onConfirm={doSubmit}
      />

      <CheatingWarningModal
        open={cheatingDetection.isWarningVisible}
        onClose={cheatingDetection.dismissWarning}
        violationType={cheatingDetection.lastViolationType}
        totalViolations={cheatingDetection.totalViolations}
      />

      <div className="min-h-screen">
        <div className="container max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleExit} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Thoát
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">Bài thi</h1>
                <p className="text-muted-foreground">
                  Câu {currentQuestionIndex + 1} / {totalQuestions}
                </p>
              </div>

              <div
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg",
                  remainingTime !== null && remainingTime <= 60
                    ? "bg-destructive/10 text-destructive animate-pulse"
                    : "bg-muted"
                )}>
                <Clock className="h-5 w-5" />
                {remainingTime !== null ? (
                  <span>
                    {formatTime(remainingTime)}
                    <span className="text-sm text-muted-foreground ml-1">
                      còn lại
                    </span>
                  </span>
                ) : (
                  <span>{formatTime(timeSpentSeconds)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2">
              <span>
                Tiến độ: {answeredCount}/{totalQuestions} câu
              </span>
              <span>{progressPercentage.toFixed(0)}%</span>
            </div>
            <Progress value={progressPercentage} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-6">
              {currentQuestion && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="mb-4 flex justify-between items-start">
                      <h2 className="text-lg font-semibold">
                        Câu {currentQuestionIndex + 1}/{totalQuestions}
                      </h2>
                      <Button
                        variant={
                          markedForReview.has(currentQuestion.id)
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={handleMarkForReview}>
                        <Flag className="h-4 w-4 mr-2" />
                        {markedForReview.has(currentQuestion.id)
                          ? "Đã đánh dấu"
                          : "Đánh dấu"}
                      </Button>
                    </div>

                    <StandardMarkdownRenderer
                      content={currentQuestion.question}
                      className="mb-6"
                      fontSize={16}
                    />

                    <RadioGroup
                      value={answers[currentQuestion.id] || ""}
                      onValueChange={handleAnswerSelect}
                      className="space-y-3">
                      {currentQuestion.options.map((option, index) => {
                        const optionLetter = String.fromCharCode(65 + index);
                        const isSelected =
                          answers[currentQuestion.id] === optionLetter;

                        return (
                          <div
                            key={index}
                            className={cn(
                              "flex items-start space-x-3 p-4 rounded-lg border-2 transition-colors cursor-pointer",
                              isSelected
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/50"
                            )}
                            onClick={() => handleAnswerSelect(optionLetter)}>
                            <RadioGroupItem
                              value={optionLetter}
                              id={`option-${index}`}
                            />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer">
                              <StandardMarkdownRenderer
                                content={option}
                                fontSize={15}
                              />
                            </Label>
                          </div>
                        );
                      })}
                    </RadioGroup>
                  </CardContent>
                </Card>
              )}

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Câu trước
                </Button>

                {currentQuestionIndex === totalQuestions - 1 ? (
                  <Button onClick={handleSubmitClick}>Nộp bài</Button>
                ) : (
                  <Button onClick={handleNext}>
                    Câu sau
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                )}
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-6">
                <CardContent className="pt-6">
                  <h3 className="font-semibold mb-4 flex items-center">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Danh sách câu hỏi
                  </h3>

                  <div className="grid grid-cols-5 gap-2">
                    {questions.map((q, index) => {
                      const isAnswered = !!answers[q.id];
                      const isMarked = markedForReview.has(q.id);
                      const isCurrent = index === currentQuestionIndex;

                      return (
                        <button
                          key={q.id}
                          onClick={() => handleQuestionClick(index)}
                          className={cn(
                            "aspect-square rounded-md text-sm font-medium transition-colors relative",
                            isCurrent && "ring-2 ring-primary ring-offset-2",
                            isAnswered &&
                              !isCurrent &&
                              "bg-primary text-primary-foreground",
                            !isAnswered &&
                              !isCurrent &&
                              "bg-muted hover:bg-muted/80"
                          )}>
                          {index + 1}
                          {isMarked && (
                            <Flag className="h-3 w-3 absolute top-0 right-0 text-orange-500" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-primary rounded" />
                      <span>Đã trả lời ({answeredCount})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded" />
                      <span>
                        Chưa trả lời ({totalQuestions - answeredCount})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-orange-500" />
                      <span>Đánh dấu ({markedForReview.size})</span>
                    </div>
                  </div>

                  {remainingTime !== null &&
                    remainingTime <= 300 &&
                    remainingTime > 0 && (
                      <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-200 text-sm">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Còn {Math.ceil(remainingTime / 60)} phút</span>
                        </div>
                      </div>
                    )}

                  <Button
                    className="w-full mt-6"
                    onClick={handleSubmitClick}
                    variant="default">
                    Nộp bài
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
