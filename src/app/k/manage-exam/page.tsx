"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ExamManagementTemplate } from "@/templates/ExamManagementTemplate";
import type { ExamTableData } from "@/components/organisms/k/ExamTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useQuizSetStore } from "@/stores/useQuizSetStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useExportPDF } from "@/hooks/useExportPDF";
import { QuizSetModal } from "@/components/organisms/QuizSetModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import type { QuizSetFormData } from "@/components/molecules/QuizSetForm";
import { TableSkeletonLoader } from "@/components/organisms/TableSkeletonLoader";

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
  const { exportQuizSetsToPDF } = useExportPDF();

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
    null
  );
  const [editFormData, setEditFormData] = useState<QuizSetFormData | undefined>(
    undefined
  );

  // State để lưu stats ban đầu (không bị ảnh hưởng bởi filter/search)
  const [originalStats, setOriginalStats] = useState({
    totalExams: 0,
    activeExams: 0,
    totalQuestions: 0,
    completionRate: 0,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch quiz sets lần đầu để lấy stats tổng thể (không filter)
  useEffect(() => {
    const loadInitialStats = async () => {
      const response = await fetchQuizSets({
        page: 1,
        limit: 9999, // Lấy tất cả để tính stats
      });

      if (response) {
        const totalQuestions = response.quizSets.reduce(
          (sum, qs) => sum + (qs.questionCount || 0),
          0
        );
        setOriginalStats({
          totalExams: response.total,
          activeExams: response.quizSets.filter((qs) => qs.isPublic).length,
          totalQuestions,
          completionRate: 0, // Cần API riêng
        });
      }
    };

    loadInitialStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

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
        name: quizSet.title,
        description: quizSet.description || "",
        questionCount: quizSet.questionCount,
        status: (quizSet.isPublic ? "public" : "private") as ExamStatus,
        createdDate: new Date(quizSet.createdAt).toLocaleDateString("vi-VN"),
        lastStudied: null, // Backend chưa có thông tin này
        tags: quizSet.tags || [],
      })),
    [quizSetsK]
  );

  const totalPages = Math.ceil(totalResults / limit);

  // Tính stats từ dữ liệu thực - useMemo để tránh re-calculate
  // Sử dụng originalStats thay vì tính từ filtered data
  const stats = useMemo(
    () => ({
      totalExams: originalStats.totalExams,
      totalExamsTrend: 0, // Cần API riêng để lấy trend
      activeExams: originalStats.activeExams,
      activeExamsTrend: 0,
      totalQuestions: originalStats.totalQuestions,
      totalQuestionsTrend: 0,
      completionRate: originalStats.completionRate,
      completionRateTrend: 0,
    }),
    [originalStats]
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "public", label: "Công khai" },
      { value: "private", label: "Riêng tư" },
    ],
    []
  );

  // useCallback để tránh tạo lại function mỗi lần render
  const handleCreateExam = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    exportQuizSetsToPDF(quizSetsK, `quiz-sets-${Date.now()}`);
  }, [quizSetsK, exportQuizSetsToPDF]);

  const handleViewExam = useCallback(
    (id: string) => {
      router.push(`/k/manage-quiz-set/${id}`);
    },
    [router]
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
    [quizSetsK]
  );

  const handleDeleteExam = useCallback((id: string) => {
    setSelectedQuizSetId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedQuizSetId) {
      try {
        await deleteQuizSet(selectedQuizSetId);
        setIsDeleteDialogOpen(false);
        setSelectedQuizSetId(null);
        // Store đã tự động xóa item và stats sẽ tự update qua useMemo
      } catch (error) {
        console.error("Delete quiz set error:", error);
      }
    }
  }, [selectedQuizSetId, deleteQuizSet]);

  const handleCreateSubmit = useCallback(
    async (data: QuizSetFormData) => {
      try {
        await createQuizSet({
          title: data.title,
          description: data.description || "",
          isPublic: data.isPublic,
          isPinned: data.isPinned,
          tags: data.tags,
          thumbnail: data.thumbnail || null,
          questionCount: 0,
          questions: [],
        });
        setIsCreateModalOpen(false);
        // Store đã tự động thêm item mới và stats sẽ tự update qua useMemo
      } catch (error) {
        console.error("Create quiz set error:", error);
      }
    },
    [createQuizSet]
  );

  const handleEditSubmit = useCallback(
    async (data: QuizSetFormData) => {
      if (selectedQuizSetId) {
        try {
          await updateQuizSet(selectedQuizSetId, {
            title: data.title,
            description: data.description || "",
            isPublic: data.isPublic,
            isPinned: data.isPinned,
            tags: data.tags,
            thumbnail: data.thumbnail || null,
            questionCount: 0,
            questions: [],
          });
          setIsEditModalOpen(false);
          setSelectedQuizSetId(null);
          setEditFormData(undefined);
          // Store đã tự động update item và stats sẽ tự update qua useMemo
        } catch (error) {
          console.error("Update quiz set error:", error);
        }
      }
    },
    [selectedQuizSetId, updateQuizSet]
  );

  if (loading && quizSetsK.length === 0) {
    return <TableSkeletonLoader rows={10} />;
  }

  return (
    <>
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
        onExport={handleExport}
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
    </>
  );
}
