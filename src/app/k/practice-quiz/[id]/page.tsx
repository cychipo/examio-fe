/* eslint-disable react-dom/no-dangerously-set-innerhtml */
"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";
import { PracticeSettingsModal } from "@/components/organisms/PracticeSettingsModal";
import { toast } from "@/components/ui/toast";
import { useDebounce } from "@/hooks/useDebounce";
import {
  getOrCreateAttemptApi,
  updateAttemptApi,
  submitAttemptApi,
  resetAttemptApi,
  QuizPracticeAttempt,
} from "@/apis/quizPracticeAttemptApi";

interface QuizPracticePageProps {
  params: Promise<{ id: string }>;
}

export default function QuizPracticePage({ params }: QuizPracticePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentQuizSet, fetchQuizSetById, loading } = useQuizSetStore();

  // Practice settings state
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [practiceStarted, setPracticeStarted] = useState(false);

  // Attempt state
  const [attempt, setAttempt] = useState<QuizPracticeAttempt | null>(null);
  const [attemptLoading, setAttemptLoading] = useState(false);

  // Quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [markedForReview, setMarkedForReview] = useState<Set<string>>(
    () => new Set()
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showDetailedResults, setShowDetailedResults] = useState(false);
  const [reviewQuestionIndex, setReviewQuestionIndex] = useState(0);

  // Timer state
  const [timeSpentSeconds, setTimeSpentSeconds] = useState(0);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [hasWarned30s, setHasWarned30s] = useState(false);

  // Debounce for auto-save
  const debouncedAnswers = useDebounce(answers, 1000);
  const debouncedCurrentIndex = useDebounce(currentQuestionIndex, 1000);
  const debouncedTimeSpent = useDebounce(timeSpentSeconds, 5000);

  // Define saveProgress callback - accepts optional params to ensure latest values
  const saveProgress = useCallback(
    async (overrideAnswers?: Record<string, string>) => {
      if (!attempt || isSubmitted) return;

      const answersToSave = overrideAnswers ?? answers;
      try {
        await updateAttemptApi(attempt.id, {
          answers: answersToSave,
          currentIndex: currentQuestionIndex,
          markedQuestions: Array.from(markedForReview),
          timeSpentSeconds,
        });
      } catch (error) {
        console.error("Failed to save progress:", error);
      }
    },
    [
      attempt,
      answers,
      currentQuestionIndex,
      markedForReview,
      timeSpentSeconds,
      isSubmitted,
    ]
  );

  // Define handleAutoSubmit callback
  const handleAutoSubmit = useCallback(async () => {
    if (!attempt) return;

    try {
      console.log("DEBUG: handleAutoSubmit - before update", {
        attemptId: attempt.id,
        answers,
        currentIndex: currentQuestionIndex,
        markedQuestions: Array.from(markedForReview),
        timeSpentSeconds,
      });
      // Save progress first before auto-submit
      await updateAttemptApi(attempt.id, {
        answers,
        currentIndex: currentQuestionIndex,
        markedQuestions: Array.from(markedForReview),
        timeSpentSeconds,
      });

      console.log("DEBUG: handleAutoSubmit - after update, calling submit", {
        attemptId: attempt.id,
      });
      const result = await submitAttemptApi(attempt.id);
      console.log("DEBUG: handleAutoSubmit - submit result", result);
      setScore(result.correctAnswers);
      setIsSubmitted(true);
      setAttempt(result.attempt);
      toast.info("Đã hết thời gian", {
        description: "Bài thi đã được tự động nộp",
      });
    } catch (error) {
      console.error("Failed to auto-submit:", error);
    }
  }, [
    attempt,
    answers,
    currentQuestionIndex,
    markedForReview,
    timeSpentSeconds,
  ]);

  // Define checkExistingAttempt callback
  const checkExistingAttempt = useCallback(async () => {
    setAttemptLoading(true);
    try {
      // Try to get or create attempt with type 0 (PRACTICE)
      const response = await getOrCreateAttemptApi({
        quizSetId: id,
        type: 0,
      });

      if (response.attempt) {
        const existingAttempt = response.attempt;

        if (existingAttempt.isSubmitted) {
          // Show result and option to retry
          setAttempt(existingAttempt);
          setIsSubmitted(true);
          setScore(existingAttempt.correctAnswers);
          setAnswers(existingAttempt.answers || {});
          setPracticeStarted(true);
        } else if (!response.isNew && existingAttempt.timeSpentSeconds > 0) {
          // Resume existing attempt only if user already started (has spent time)
          setAttempt(existingAttempt);
          setAnswers(existingAttempt.answers || {});
          setCurrentQuestionIndex(existingAttempt.currentIndex || 0);
          setMarkedForReview(new Set(existingAttempt.markedQuestions || []));
          setTimeSpentSeconds(existingAttempt.timeSpentSeconds || 0);
          setTimeLimitMinutes(existingAttempt.timeLimitMinutes);
          setPracticeStarted(true);
        } else {
          // New attempt or never started - show settings modal
          // Save the attempt reference for later update with time limit
          setAttempt(existingAttempt);
          setShowSettingsModal(true);
        }
      }
    } catch (error) {
      console.error("Failed to check existing attempt:", error);
      setShowSettingsModal(true);
    } finally {
      setAttemptLoading(false);
    }
  }, [id]);

  // Fetch quiz set on mount
  useEffect(() => {
    fetchQuizSetById(id);
  }, [id, fetchQuizSetById]);

  // Check for existing attempt when quiz set is loaded
  useEffect(() => {
    if (currentQuizSet && !practiceStarted && !attemptLoading) {
      checkExistingAttempt();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuizSet]);

  // Timer effect
  useEffect(() => {
    if (practiceStarted && !isSubmitted && attempt) {
      timerRef.current = setInterval(() => {
        setTimeSpentSeconds((prev) => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [practiceStarted, isSubmitted, attempt]);

  // Check time limit and auto-submit
  useEffect(() => {
    if (timeLimitMinutes && practiceStarted && !isSubmitted) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    timeSpentSeconds,
    timeLimitMinutes,
    practiceStarted,
    isSubmitted,
    hasWarned30s,
  ]);

  // Auto-save effect
  useEffect(() => {
    if (attempt && practiceStarted && !isSubmitted) {
      saveProgress();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedAnswers, debouncedCurrentIndex, debouncedTimeSpent]);

  // Save progress before unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (attempt && practiceStarted && !isSubmitted) {
        // Sync save on unload
        navigator.sendBeacon(
          `${process.env.NEXT_PUBLIC_API_URL}/quiz-practice-attempts/${attempt.id}`,
          JSON.stringify({
            answers,
            currentIndex: currentQuestionIndex,
            markedQuestions: Array.from(markedForReview),
            timeSpentSeconds,
          })
        );
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [
    attempt,
    practiceStarted,
    isSubmitted,
    answers,
    currentQuestionIndex,
    markedForReview,
    timeSpentSeconds,
  ]);

  const handleStartPractice = async (timeLimitMins: number | null) => {
    setAttemptLoading(true);
    try {
      // If we already have an attempt (from checkExistingAttempt), update it with time limit
      if (attempt) {
        await updateAttemptApi(attempt.id, {
          timeSpentSeconds: 0,
          timeLimitMinutes: timeLimitMins,
        });
        // Update local state
        setAttempt({
          ...attempt,
          timeLimitMinutes: timeLimitMins,
          timeSpentSeconds: 0,
        });
        setTimeLimitMinutes(timeLimitMins);
      } else {
        // Create new attempt
        const response = await getOrCreateAttemptApi({
          quizSetId: id,
          type: 0,
          timeLimitMinutes: timeLimitMins,
        });

        setAttempt(response.attempt);
        setTimeLimitMinutes(timeLimitMins);
      }
      // Close modal and start practice AFTER successful API call
      setShowSettingsModal(false);
      setPracticeStarted(true);
    } catch (error) {
      toast.error("Không thể bắt đầu bài thi");
      console.error("Failed to start practice:", error);
    } finally {
      setAttemptLoading(false);
    }
  };

  const questions = currentQuizSet?.questions || [];
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
    if (!attempt) return;

    try {
      // Debug: log intent to submit and current client state
      console.log("DEBUG: doSubmit - before save/submit", {
        attemptId: attempt.id,
        answers,
        currentIndex: currentQuestionIndex,
        markedQuestions: Array.from(markedForReview),
        timeSpentSeconds,
      });

      // Save latest progress first - pass current answers to ensure latest values
      await saveProgress(answers);

      // Submit
      const result = await submitAttemptApi(attempt.id);
      console.log("DEBUG: doSubmit - submit result", result);
      setScore(result.correctAnswers);
      setIsSubmitted(true);
      setAttempt(result.attempt);
      setShowSubmitConfirm(false);

      toast.success("Nộp bài thành công!");
    } catch (error) {
      toast.error("Nộp bài thất bại");
      console.error("Failed to submit:", error);
    }
  };

  // Debug: log submission summary when submission state changes
  useEffect(() => {
    if (isSubmitted) {
      console.log("DEBUG: submission summary", {
        attemptId: attempt?.id,
        attemptAnswers: attempt?.answers,
        attemptCorrectAnswers: attempt?.correctAnswers,
        clientScore: score,
        clientAnswers: answers,
        totalQuestions,
        answeredCount,
      });
    }
  }, [isSubmitted, attempt, score, answers, totalQuestions, answeredCount]);

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

  const handleRetry = async () => {
    if (!attempt) return;

    // Show settings modal for new time limit
    setShowSettingsModal(true);
  };

  const handleRetryWithSettings = async (timeLimitMins: number | null) => {
    if (!attempt) return;

    try {
      const result = await resetAttemptApi(attempt.id, timeLimitMins);
      setAttempt(result.attempt);
      setAnswers({});
      setMarkedForReview(new Set());
      setIsSubmitted(false);
      setScore(null);
      setCurrentQuestionIndex(0);
      setShowDetailedResults(false);
      setReviewQuestionIndex(0);
      setTimeSpentSeconds(0);
      setTimeLimitMinutes(timeLimitMins);
      setHasWarned30s(false);
      setShowSettingsModal(false);
    } catch (error) {
      toast.error("Không thể làm lại bài thi");
      console.error("Failed to reset attempt:", error);
    }
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
    router.push("/k/manage-exam");
  };

  // Loading state
  if (loading || !currentQuizSet || attemptLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  // Settings modal for new attempt
  if (!practiceStarted && showSettingsModal) {
    return (
      <>
        <PracticeSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          onStart={handleStartPractice}
          onCancel={() => router.push("/k/manage-exam")}
          quizSetTitle={currentQuizSet.title}
          questionCount={totalQuestions}
        />
      </>
    );
  }

  // No questions available
  if (totalQuestions === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <XCircle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Không có câu hỏi</h1>
          <p className="text-muted-foreground mb-4">
            Bộ đề thi này chưa có câu hỏi nào
          </p>
          <Button onClick={handleExit}>Quay lại</Button>
        </div>
      </div>
    );
  }

  // Results view - score holds the number of correct answers
  if (isSubmitted && score !== null) {
    const correctAnswersCount = score;
    const percentage =
      totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0;
    const passed = percentage >= 40;

    // Settings modal for retry
    if (showSettingsModal) {
      return (
        <PracticeSettingsModal
          open={showSettingsModal}
          onOpenChange={setShowSettingsModal}
          onStart={handleRetryWithSettings}
          quizSetTitle={currentQuizSet.title}
          questionCount={totalQuestions}
        />
      );
    }

    // Detailed results view
    if (showDetailedResults) {
      const reviewQuestion = questions[reviewQuestionIndex];
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
                {currentQuizSet.title} - Câu {reviewQuestionIndex + 1}/
                {totalQuestions}
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
                      {questions.map((q, index) => {
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
                        <span>Đúng ({score})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-destructive rounded" />
                        <span>
                          Sai (
                          {totalQuestions -
                            score -
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
                      <Button
                        className="w-full"
                        variant="outline"
                        onClick={handleRetry}>
                        Làm lại
                      </Button>
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

              <div className="grid grid-cols-4 gap-4 max-w-lg mx-auto">
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
                    {formatTime(attempt?.timeSpentSeconds || timeSpentSeconds)}
                  </div>
                  <div className="text-sm text-muted-foreground">Thời gian</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button onClick={handleViewDetails} variant="default">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Xem chi tiết
                </Button>
                <Button onClick={handleRetry} variant="outline">
                  Làm lại
                </Button>
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

  // Practice view
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

      <div className="min-h-screen">
        <div className="container max-w-7xl mx-auto py-6 px-4">
          <div className="mb-6">
            <Button variant="ghost" onClick={handleExit} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold">{currentQuizSet.title}</h1>
                <p className="text-muted-foreground">
                  {currentQuizSet.description}
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

                    <div
                      className="prose dark:prose-invert max-w-none mb-6"
                      dangerouslySetInnerHTML={{
                        __html: currentQuestion.question,
                      }}
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
                              <span
                                dangerouslySetInnerHTML={{ __html: option }}
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
