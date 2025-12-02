"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Plus,
  Edit,
  Trash2,
  FileText,
  Eye,
  PlayCircle,
} from "lucide-react";
import { Quizz } from "@/types/quizset";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { QuestionEditorDialog } from "@/components/organisms/QuestionEditorDialog";
import { RichTextViewer } from "@/components/molecules/RichTextViewer";

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
  const router = useRouter();
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

  // Fetch quiz set by ID
  useEffect(() => {
    if (id) {
      fetchQuizSetById(id);
    }
  }, [id, fetchQuizSetById]);

  // Handlers
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

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
    }
  }, [questionToDelete, id, deleteQuestion]);

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
    },
    [selectedQuestion, id, addQuestion, updateQuestion]
  );

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
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" size="icon" onClick={handleBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <h1 className="text-3xl font-bold tracking-tight">
                {currentQuizSet.title}
              </h1>
              <p className="text-muted-foreground mt-1">
                {currentQuizSet.description || "Không có mô tả"}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() =>
                  router.push(`/k/practice-quiz/${currentQuizSet.id}`)
                }
                className="gap-2">
                <PlayCircle className="h-4 w-4" />
                Thi thử
              </Button>
              <Badge
                variant={currentQuizSet.isPublic ? "default" : "secondary"}>
                {currentQuizSet.isPublic ? "Công khai" : "Riêng tư"}
              </Badge>
              {currentQuizSet.isPinned && (
                <Badge variant="outline">📌 Đã ghim</Badge>
              )}
            </div>
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
        <div className="grid gap-4 md:grid-cols-3 mb-8">
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
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Lượt xem
                </p>
                <p className="text-2xl font-bold">0</p>
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
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Question Editor Dialog */}
        <QuestionEditorDialog
          open={showQuestionForm}
          onOpenChange={setShowQuestionForm}
          question={selectedQuestion}
          onSave={handleSaveQuestion}
        />

        {/* Questions List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Danh sách câu hỏi</h2>
            <Button onClick={handleAddQuestion} disabled={showQuestionForm}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm câu hỏi
            </Button>
          </div>

          {currentQuizSet.questions && currentQuizSet.questions.length > 0 ? (
            <div className="space-y-4">
              {currentQuizSet.questions.map((question, index) => (
                <Card
                  key={question.id}
                  className="p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-semibold text-primary">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <RichTextViewer content={question.question} />
                      </div>
                      <div className="space-y-1">
                        {question.options.map((option, optIndex) => {
                          // Compare with letter (A, B, C, D) or index
                          const optionLetter = String.fromCharCode(
                            65 + optIndex
                          );
                          const isCorrect =
                            question.answer === optionLetter ||
                            question.answer === optIndex.toString();
                          return (
                            <div
                              key={optIndex}
                              className={`text-sm p-2 rounded flex items-start gap-2 ${
                                isCorrect
                                  ? "bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 font-medium"
                                  : "bg-muted/50"
                              }`}>
                              <span className="font-medium flex-shrink-0">
                                {optionLetter}.
                              </span>
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
                        disabled={showQuestionForm}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="errorGhost"
                        size="sm"
                        onClick={() => handleDeleteQuestion(question.id)}
                        disabled={showQuestionForm}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
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
