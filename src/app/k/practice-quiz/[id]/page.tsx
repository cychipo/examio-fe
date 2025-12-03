"use client";

import { use, useState, useEffect } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ConfirmDialog } from "@/components/organisms/ConfirmDialog";

interface QuizPracticePageProps {
  params: Promise<{ id: string }>;
}

export default function QuizPracticePage({ params }: QuizPracticePageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { currentQuizSet, fetchQuizSetById, loading } = useQuizSetStore();

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

  // Fetch quiz set on mount
  useEffect(() => {
    fetchQuizSetById(id);
  }, [id, fetchQuizSetById]);

  if (loading || !currentQuizSet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  const questions = currentQuizSet.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const answeredCount = Object.keys(answers).length;
  const progressPercentage =
    totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

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

  const doSubmit = () => {
    // Calculate score
    let correctCount = 0;
    questions.forEach((q) => {
      if (answers[q.id] === q.answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setIsSubmitted(true);
    setShowSubmitConfirm(false);
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

  const handleRetry = () => {
    setAnswers({});
    setMarkedForReview(new Set());
    setIsSubmitted(false);
    setScore(null);
    setCurrentQuestionIndex(0);
    setShowDetailedResults(false);
    setReviewQuestionIndex(0);
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

  // Results view
  if (isSubmitted && score !== null) {
    const percentage = (score / totalQuestions) * 100;
    const passed = percentage >= 50;

    // Detailed results view - show each question with correct/incorrect status
    if (showDetailedResults) {
      const reviewQuestion = questions[reviewQuestionIndex];
      const userAnswer = answers[reviewQuestion.id];
      const isCorrect = userAnswer === reviewQuestion.answer;

      return (
        <div className="min-h-screen">
          <div className="container max-w-7xl mx-auto py-6 px-4">
            {/* Header */}
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
              {/* Main content */}
              <div className="lg:col-span-3 space-y-6">
                {/* Question card with result */}
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
                              <span className="font-semibold mr-2">
                                {optionLetter}.
                              </span>
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

                {/* Navigation buttons */}
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

              {/* Sidebar */}
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

              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {score}
                  </div>
                  <div className="text-sm text-muted-foreground">Đúng</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-destructive">
                    {totalQuestions - score}
                  </div>
                  <div className="text-sm text-muted-foreground">Sai</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">
                    {percentage.toFixed(0)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Điểm</div>
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
          {/* Header */}
          <div className="mb-6">
            <Button variant="ghost" onClick={handleExit} className="mb-4">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Quay lại
            </Button>
            <h1 className="text-2xl font-bold">{currentQuizSet.title}</h1>
            <p className="text-muted-foreground">
              {currentQuizSet.description}
            </p>
          </div>

          {/* Progress */}
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
            {/* Main content */}
            <div className="lg:col-span-3 space-y-6">
              {/* Question card */}
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
                              <span className="font-semibold mr-2">
                                {optionLetter}.
                              </span>
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

              {/* Navigation buttons */}
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

            {/* Sidebar */}
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
                      <span>Đã trả lời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded" />
                      <span>Chưa trả lời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Flag className="h-4 w-4 text-orange-500" />
                      <span>Đánh dấu</span>
                    </div>
                  </div>

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
