import { useEffect, useState, useCallback } from "react";
import { Link, useParams } from "react-router-dom";
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
import type { Quizz } from "@/types/quizset";
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

export default function ManageQuizSetDetailPage() {
  const { id = "" } = useParams();
  const {
    currentQuizSet,
    loading,
    fetchQuizSetById,
    addQuestion,
    updateQuestion,
    deleteQuestion,
  } = useQuizSetStore();

  const [selectedQuestion, setSelectedQuestion] = useState<Quizz | null>(null);
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedQuestions, setPaginatedQuestions] = useState<Quizz[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const itemsPerPage = 9;

  useEffect(() => {
    if (id) {
      fetchQuizSetById(id);
    }
  }, [id, fetchQuizSetById]);

  const fetchQuestions = useCallback(async () => {
    if (!id) return;

    setQuestionsLoading(true);
    try {
      const response = await getQuizSetQuestionsApi(id, currentPage, itemsPerPage);
      setPaginatedQuestions(response.questions);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch questions:", error);
    } finally {
      setQuestionsLoading(false);
    }
  }, [id, currentPage]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleAddQuestion = useCallback(() => {
    setSelectedQuestion(null);
    setShowQuestionForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEditQuestion = useCallback((question: Quizz) => {
    setSelectedQuestion(question);
    setShowQuestionForm(true);
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
      if (paginatedQuestions.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchQuestions();
      }
    }
  }, [questionToDelete, id, deleteQuestion, paginatedQuestions.length, currentPage, fetchQuestions]);

  const handleSaveQuestion = useCallback(
    async (questionData: any) => {
      if (!id) return;

      if (selectedQuestion) {
        await updateQuestion(id, selectedQuestion.id, questionData);
      } else {
        await addQuestion(id, questionData);
      }
      setShowQuestionForm(false);
      setSelectedQuestion(null);
      fetchQuestions();
    },
    [selectedQuestion, id, addQuestion, updateQuestion, fetchQuestions],
  );

  const totalQuestions = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  if (loading || !currentQuizSet) {
    return (
      <div className="min-h-screen">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Skeleton className="mb-6 h-10 w-full" />
          <div className="mb-8 grid gap-6 md:grid-cols-3">
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
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between gap-4">
            <div className="flex-1">
              <Breadcrumb className="mb-3">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link to="/k/manage-exam">Quản lý bộ đề</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentQuizSet.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="flex items-center gap-2" />
          </div>

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

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tổng số câu hỏi</p>
                <p className="text-2xl font-bold">{currentQuizSet.questions?.length || 0}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-primary/10 p-3">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Ngày tạo</p>
                <p className="text-sm font-medium">
                  {new Date(currentQuizSet.createdAt).toLocaleDateString("vi-VN")}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <LabelManager quizSetId={id} />

        <QuestionEditorDialog
          open={showQuestionForm}
          onOpenChange={setShowQuestionForm}
          question={selectedQuestion}
          onSave={handleSaveQuestion}
          quizSetId={id}
        />

        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Danh sách câu hỏi
              {totalQuestions > 0 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">({totalQuestions} câu)</span>
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
          ) : paginatedQuestions.length > 0 ? (
            <div className="space-y-4">
              {paginatedQuestions.map((question, index) => {
                const actualIndex = (currentPage - 1) * itemsPerPage + index;
                return (
                  <Card key={question.id} className="p-4 transition-shadow hover:shadow-md">
                    <div className="flex items-start gap-4">
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                        {actualIndex + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        {question.label && (
                          <div className="mb-2">
                            <div
                              className="inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium"
                              style={{
                                backgroundColor: question.label.color ? `${question.label.color}15` : undefined,
                                borderColor: question.label.color || undefined,
                                color: question.label.color || undefined,
                              }}
                            >
                              {question.label.color && (
                                <div
                                  className="h-2 w-2 rounded-full"
                                  style={{ backgroundColor: question.label.color }}
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
                            const optionLetter = String.fromCharCode(65 + optIndex);
                            const isCorrect =
                              question.answer === optionLetter || question.answer === optIndex.toString();
                            return (
                              <div
                                key={optIndex}
                                className={`flex items-start gap-2 rounded p-2 text-sm ${
                                  isCorrect ? "bg-green-50 font-medium text-green-700" : "bg-muted/50"
                                }`}
                              >
                                <div className="flex-1">
                                  <RichTextViewer content={option} />
                                </div>
                                {isCorrect && <span className="ml-2 flex-shrink-0">✓ Đáp án đúng</span>}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleEditQuestion(question)} disabled={showQuestionForm}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="errorGhost" size="sm" onClick={() => handleDeleteQuestion(question.id)} disabled={showQuestionForm}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}

              {totalPages > 1 && (
                <div className="flex items-center justify-between border-t pt-4">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, totalQuestions)} / {totalQuestions} câu hỏi
                  </p>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
                      <ChevronLeft className="h-4 w-4" />
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) pageNum = i + 1;
                        else if (currentPage <= 3) pageNum = i + 1;
                        else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                        else pageNum = currentPage - 2 + i;
                        return (
                          <Button
                            key={pageNum}
                            variant={currentPage === pageNum ? "default" : "outline"}
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setCurrentPage(pageNum)}
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                      Sau
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-12 text-center text-muted-foreground">
              <FileText className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>Chưa có câu hỏi nào</p>
              <p className="mt-2 text-sm">Nhấn "Thêm câu hỏi" để bắt đầu tạo bộ đề</p>
            </div>
          )}
        </Card>
      </div>

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
