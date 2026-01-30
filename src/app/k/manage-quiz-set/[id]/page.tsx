"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Trash2,
  FileText,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Quizz } from "@/types/quizset";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { QuestionEditorDialog } from "@/components/organisms/QuestionEditorDialog";
import { LabelManager } from "@/components/organisms/LabelManager";
import { RichTextViewer } from "@/components/molecules/RichTextViewer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { getQuizSetQuestionsApi, type PaginationInfo } from "@/apis/quizsetApi";

/**
 * Quiz Set Detail Page
 * Hiển thị chi tiết bộ đề thi và danh sách câu hỏi
 * Cho phép thêm, sửa, xóa câu hỏi với inline form
 */
export default function QuizSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const _router = useRouter();
  const {
    currentQuizSet,
    loading,
    fetchQuizSetById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuizSetStore();

  // States
  const [selectedQuestion, setSelectedQuestion] = useState<Quizz | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

  // Pagination state - now fetched from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedQuestions, setPaginatedQuestions] = useState<Quizz[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const itemsPerPage = 9;

  // Fetch quiz set by ID (basic info only)
  useEffect(() => {
    if (id) {
      fetchQuizSetById(id);
    }
  }, [id, fetchQuizSetById]);

  // Fetch paginated questions from backend
  const fetchQuestions = useCallback(async () => {
    if (!id) return;

    setQuestionsLoading(true);
    try {
      const response = await getQuizSetQuestionsApi(
        id,
        currentPage,
        itemsPerPage,
      );
      setPaginatedQuestions(response.questions);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setQuestionsLoading(false);
    }
  }, [id, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Handlers
  const handleAddQuestion = useCallback(() => {
    setSelectedQuestion(null);
    setShowQuestionForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEditQuestion = useCallback((question: Quizz) => {
    setSelectedQuestion(question);
    setShowQuestionForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteQuestion = useCallback((questionId: string) => {
    setQuestionToDelete(questionId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (questionToDelete && id) {
      await deleteQuestion(id, questionToDelete);
      setIsDeleteDialogOpen(false);
      setQuestionToDelete(null);
      // Refetch questions after delete
      // If current page has no items, go back to previous page
      if (paginatedQuestions.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchQuestions();
      }
    }
  }, [
    questionToDelete,
    id,
    deleteQuestion,
    paginatedQuestions.length,
    currentPage,
    fetchQuestions,
  ]);

  const handleSaveQuestion = useCallback(
    async (questionData: any) => {
      if (!id) return;

      if (selectedQuestion) {
        // Update existing question
        await updateQuestion(id, selectedQuestion.id, questionData);
      } else {
        // Add new question
        await addQuestion(id, questionData);
      }
      setShowQuestionForm(false);
      setSelectedQuestion(null);
      // Refetch questions to get updated list
      fetchQuestions();
    },
    [selectedQuestion, id, addQuestion, updateQuestion, fetchQuestions],
  );

  // Derived values from pagination
  const totalQuestions = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  // Loading state
  if (loading || !currentQuizSet) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="h-10 w-full mb-6" />
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with Breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex-1">
              <Breadcrumb className="mb-3">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/k/manage-exam">Quản lý bộ đề</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentQuizSet.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2"></div>
          </div>

          {/* Tags */}
          {currentQuizSet.tags && currentQuizSet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentQuizSet.tags.map((tag) => (
                <Badge key={tag} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng số câu hỏi
                </p>
                <p className="text-2xl font-bold">
                  {currentQuizSet.questions?.length || 0}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="text-sm font-medium">
                  {new Date(currentQuizSet.createdAt).toLocaleDateString(
                    "vi-VN",
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Label Manager */}
        <LabelManager quizSetId={id} />

        {/* Question Editor Dialog */}
        <QuestionEditorDialog
          open={showQuestionForm}
          onOpenChange={setShowQuestionForm}
          question={selectedQuestion}
          onSave={handleSaveQuestion}
          quizSetId={id}
        />

        {/* Questions List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Danh sách câu hỏi
              {totalQuestions > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({totalQuestions} câu)
                </span>
              )}
            </h2>
            <Button onClick={handleAddQuestion} disabled={showQuestionForm}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>

          {questionsLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : paginatedQuestions && paginatedQuestions.length > 0 ? (
            <div className="space-y-4">
              {paginatedQuestions.map((question, index) => {
                // Calculate actual index across all pages
                const actualIndex = (currentPage - 1) * itemsPerPage + index;
                return (
                  <Card
                    key={question.id}
                    className="p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                        {actualIndex + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        {/* Label badge */}
                        {question.label && (
                          <div className="mb-2">
                            <div
                              className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium border"
                              style={{
                                backgroundColor: question.label.color
                                  ? `${question.label.color}15`
                                  : undefined,
                                borderColor: question.label.color || undefined,
                                color: question.label.color || undefined,
                              }}
                            >
                              {question.label.color && (
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{
                                    backgroundColor: question.label.color,
                                  }}
                                />
                              )}
                              {question.label.name}
                            </div>
                          </div>
                        )}
                        <div className="mb-2">
                          <RichTextViewer content={question.question} />
                        </div>
                        <div className="space-y-1">
                          {question.options.map((option, optIndex) => {
                            // Compare with letter (A, B, C, D) or index
                            const optionLetter = String.fromCharCode(
                              65 + optIndex,
                            );
                            const isCorrect =
                              question.answer === optionLetter ||
                              question.answer === optIndex.toString();
                            return (
                              <div
                                key={optIndex}
                                className={`text-sm p-2 rounded flex items-start gap-2 ${
                                  isCorrect
                                    ? "bg-green-50 text-green-700 font-medium"
                                    : "bg-muted/50"
                                }`}
                              >
                                <div className="flex-1">
                                  <RichTextViewer content={option} />
                                </div>
                                {isCorrect && (
                                  <span className="ml-2 flex-shrink-0">
                                    ✓ Đáp án đúng
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditQuestion(question)}
                          disabled={showQuestionForm}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="errorGhost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(question.id)}
                          disabled={showQuestionForm}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalQuestions)} /{" "}
                    {totalQuestions} câu hỏi
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        { length: Math.min(5, totalPages) },
                        (_, i) => {
                          let pageNum: number;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={
                                currentPage === pageNum ? "default" : "outline"
                              }
                              size="sm"
                              className="w-8 h-8 p-0"
                              onClick={() => setCurrentPage(pageNum)}
                            >
                              {pageNum}
                            </Button>
                          );
                        },
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có câu hỏi nào</p>
              <p className="text-sm mt-2">
                Nhấn "Thêm câu hỏi" để bắt đầu tạo bộ đề
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa câu hỏi"
        description="Bạn có chắc chắn muốn xóa câu hỏi này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
