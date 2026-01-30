"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamManagementTemplate } from "@/templates/ExamManagementTemplate";
import type { ExamTableData } from "@/components/organisms/k/ExamTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useExportPDF } from "@/hooks/useExportPDF";
import { QuizSetModal } from "@/components/organisms/QuizSetModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import type { QuizSetFormData } from "@/components/molecules/QuizSetForm";
import { TableSkeletonLoader } from "@/components/organisms/TableSkeletonLoader";
import { TeacherRoute } from "@/components/organisms/TeacherRoute";

export default function ManageExamPage() {
  const router = useRouter();
  const {
    quizSetsK,
    loading,
    fetchQuizSets,
    deleteQuizSet,
    createQuizSet,
    updateQuizSet,
  } = useQuizSetStore();
  const { quizStats, fetchQuizStats, invalidateQuizStats } = useStatsStore();
  const { exportQuizSetsToPDF: _exportQuizSetsToPDF } = useExportPDF();

  // State cho UI
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  // State cho modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedQuizSetId, setSelectedQuizSetId] = useState<string | null>(
    null,
  );
  const [editFormData, setEditFormData] = useState<QuizSetFormData | undefined>(
    undefined,
  );

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch stats using store
  useEffect(() => {
    fetchQuizStats();
  }, [fetchQuizStats]);

  // Fetch quiz sets khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    const loadQuizSets = async () => {
      const isPublic =
        statusFilter === "public"
          ? true
          : statusFilter === "private"
            ? false
            : undefined;

      const response = await fetchQuizSets({
        page: currentPage,
        limit,
        search: debouncedSearchQuery || undefined,
        isPublic,
      });

      if (response) {
        setTotalResults(response.total);
      }
    };

    loadQuizSets();
  }, [currentPage, debouncedSearchQuery, statusFilter, fetchQuizSets]);

  // Transform quiz sets data to table data format - useMemo để tránh re-calculate
  const transformedExams: ExamTableData[] = useMemo(
    () =>
      quizSetsK.map((quizSet) => ({
        id: quizSet.id,
        icon: "📘", // Default icon, có thể custom theo tags
        thumbnail: quizSet.thumbnail,
        name: quizSet.title,
        description: quizSet.description || "",
        questionCount: quizSet.questionCount,
        status: (quizSet.isPublic ? "public" : "private") as ExamStatus,
        createdDate: new Date(quizSet.createdAt).toLocaleDateString("vi-VN"),
        createdAt: quizSet.createdAt,
        lastStudied: quizSet.lastStudied
          ? new Date(quizSet.lastStudied).toLocaleDateString("vi-VN")
          : null,
        tags: quizSet.tags || [],
      })),
    [quizSetsK],
  );

  const totalPages = Math.ceil(totalResults / limit);

  // Stats object for template
  const stats = useMemo(
    () => ({
      totalExams: quizStats?.totalGroups || 0,
      totalExamsTrend: quizStats?.totalGroupsTrend || 0,
      activeExams: quizStats?.activeExams || 0,
      activeExamsTrend: 0,
      totalQuestions: quizStats?.totalQuestions || 0,
      totalQuestionsTrend: quizStats?.totalQuestionsTrend || 0,
      completionRate: quizStats?.completionRate || 0,
      completionRateTrend: 0,
    }),
    [quizStats],
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "public", label: "Công khai" },
      { value: "private", label: "Riêng tư" },
    ],
    [],
  );

  // useCallback để tránh tạo lại function mỗi lần render
  const handleCreateExam = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleViewExam = useCallback(
    (id: string) => {
      router.push(`/k/manage-quiz-set/${id}`);
    },
    [router],
  );

  const handleEditExam = useCallback(
    (id: string) => {
      const quizSet = quizSetsK.find((qs) => qs.id === id);
      if (quizSet) {
        setEditFormData({
          title: quizSet.title,
          description: quizSet.description || "",
          isPublic: quizSet.isPublic,
          isPinned: quizSet.isPinned,
          tags: quizSet.tags || [],
          thumbnail: quizSet.thumbnail || "",
        });
        setSelectedQuizSetId(id);
        setIsEditModalOpen(true);
      }
    },
    [quizSetsK],
  );

  const handleDeleteExam = useCallback((id: string) => {
    setSelectedQuizSetId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedQuizSetId) {
      try {
        await deleteQuizSet(selectedQuizSetId);
        invalidateQuizStats(); // Invalidate stats cache
        setIsDeleteDialogOpen(false);
        setSelectedQuizSetId(null);
      } catch (error) {
        console.error("Delete quiz set error:", error);
      } finally {
        await fetchQuizStats();
      }
    }
  }, [selectedQuizSetId, deleteQuizSet, invalidateQuizStats, fetchQuizStats]);

  const handleCreateSubmit = useCallback(
    async (data: QuizSetFormData) => {
      try {
        const thumbnailFile =
          data.thumbnail instanceof File ? data.thumbnail : undefined;
        const thumbnailUrl =
          typeof data.thumbnail === "string" ? data.thumbnail : null;

        await createQuizSet(
          {
            title: data.title,
            description: data.description || "",
            isPublic: data.isPublic,
            isPinned: data.isPinned,
            tags: data.tags,
            thumbnail: thumbnailUrl,
            questionCount: 0,
            questions: [],
          },
          thumbnailFile,
        );
        invalidateQuizStats(); // Invalidate stats cache
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Create quiz set error:", error);
      } finally {
        await fetchQuizStats();
      }
    },
    [createQuizSet, invalidateQuizStats, fetchQuizStats],
  );

  const handleEditSubmit = useCallback(
    async (data: QuizSetFormData) => {
      if (selectedQuizSetId) {
        try {
          const thumbnailFile =
            data.thumbnail instanceof File ? data.thumbnail : undefined;
          const thumbnailUrl =
            typeof data.thumbnail === "string" ? data.thumbnail : null;

          await updateQuizSet(
            selectedQuizSetId,
            {
              title: data.title,
              description: data.description || "",
              isPublic: data.isPublic,
              isPinned: data.isPinned,
              tags: data.tags,
              thumbnail: thumbnailUrl,
              questionCount: 0,
              questions: [],
            },
            thumbnailFile,
          );
          invalidateQuizStats(); // Invalidate stats cache
          setIsEditModalOpen(false);
          setSelectedQuizSetId(null);
          setEditFormData(undefined);
        } catch (error) {
          console.error("Update quiz set error:", error);
        } finally {
          await fetchQuizStats();
        }
      }
    },
    [selectedQuizSetId, updateQuizSet, invalidateQuizStats, fetchQuizStats],
  );

  if (loading && quizSetsK.length === 0) {
    return <TableSkeletonLoader rows={10} />;
  }

  return (
    <TeacherRoute>
      <ExamManagementTemplate
        stats={stats}
        exams={transformedExams}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        statusOptions={statusOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        onSearchChange={setSearchQuery}
        onStatusChange={setStatusFilter}
        onCreateExam={handleCreateExam}
        onViewExam={handleViewExam}
        onEditExam={handleEditExam}
        onDeleteExam={handleDeleteExam}
        onPageChange={setCurrentPage}
      />

      {/* Create Quiz Set Modal/Drawer */}
      <QuizSetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        isLoading={loading}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Quiz Set Modal/Drawer */}
      <QuizSetModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        initialData={editFormData}
        isLoading={loading}
        onSubmit={handleEditSubmit}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa đề thi"
        description="Bạn có chắc chắn muốn xóa đề thi này? Tất cả câu hỏi trong đề thi sẽ bị xóa. Hành động này không thể hoàn tác."
        isLoading={loading}
        onConfirm={handleConfirmDelete}
      />
    </TeacherRoute>
  );
}
