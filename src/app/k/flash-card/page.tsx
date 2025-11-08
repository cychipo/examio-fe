"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlashcardManagementTemplate } from "@/templates/FlashcardManagementTemplate";
import type { FlashcardTableData } from "@/components/organisms/k/FlashcardTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { useDebounce } from "@/hooks/useDebounce";
import { useExportPDF } from "@/hooks/useExportPDF";
import { FlashcardSetModal } from "@/components/organisms/FlashcardSetModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import type { FlashcardSetFormData } from "@/components/molecules/FlashcardSetForm";
import { TableSkeletonLoader } from "@/components/organisms/TableSkeletonLoader";

export default function FlashcardsPage() {
  const router = useRouter();
  const {
    flashcardSetsK,
    loading,
    fetchFlashcardSets,
    deleteFlashcardSet,
    createFlashcardSet,
    updateFlashcardSet,
  } = useFlashcardSetStore();
  const { exportFlashcardSetsToPDF } = useExportPDF();

  // State cho UI
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  // State cho modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedFlashcardSetId, setSelectedFlashcardSetId] = useState<
    string | null
  >(null);
  const [editFormData, setEditFormData] = useState<
    FlashcardSetFormData | undefined
  >(undefined);

  // State để lưu stats ban đầu (không bị ảnh hưởng bởi filter/search)
  const [originalStats, setOriginalStats] = useState({
    totalGroups: 0,
    totalCards: 0,
    avgProgress: 0,
    studiedToday: 0,
  });

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch flashcard sets lần đầu để lấy stats tổng thể (không filter)
  useEffect(() => {
    const loadInitialStats = async () => {
      const response = await fetchFlashcardSets({
        page: 1,
        limit: 9999, // Lấy tất cả để tính stats
      });

      if (response) {
        const totalCards = response.flashcardSets.reduce(
          (sum: number, fs: any) => sum + (fs._count?.detailsFlashCard || 0),
          0
        );
        setOriginalStats({
          totalGroups: response.total,
          totalCards,
          avgProgress: 0, // Cần API riêng
          studiedToday: 0, // Cần API riêng
        });
      }
    };

    loadInitialStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch flashcard sets khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    const loadFlashcardSets = async () => {
      const isPublic =
        statusFilter === "public"
          ? true
          : statusFilter === "private"
          ? false
          : undefined;

      const response = await fetchFlashcardSets({
        page: currentPage,
        limit,
        search: debouncedSearchQuery || undefined,
        isPublic,
      });

      if (response) {
        setTotalResults(response.total);
      }
    };

    loadFlashcardSets();
  }, [currentPage, debouncedSearchQuery, statusFilter, fetchFlashcardSets]);

  // Transform flashcard sets to table data format - useMemo để tránh re-calculate
  const transformedFlashcards: FlashcardTableData[] = useMemo(
    () =>
      flashcardSetsK.map((set) => ({
        id: set.id,
        icon: "🎴", // Default icon
        name: set.title,
        fileName: set.title,
        description: set.description || "",
        cardCount: set._count?.detailsFlashCard || 0,
        status: (set.isPublic ? "public" : "private") as ExamStatus,
        createdDate: new Date(set.createdAt).toLocaleDateString("vi-VN"),
        createdAt: set.createdAt,
        lastStudied: null, // Backend chưa có thông tin này
        tags: set.tags || [],
      })),
    [flashcardSetsK]
  );

  const totalPages = Math.ceil(totalResults / limit);

  // Tính stats từ originalStats - useMemo để tránh re-calculate
  const stats = useMemo(
    () => ({
      totalGroups: originalStats.totalGroups,
      totalGroupsTrend: 0, // Cần API riêng để lấy trend
      totalCards: originalStats.totalCards,
      totalCardsTrend: 0,
      avgProgress: originalStats.avgProgress,
      avgProgressTrend: 0,
      studiedToday: originalStats.studiedToday,
      studiedTodayTrend: 0,
    }),
    [originalStats]
  );

  const sortOptions = useMemo(
    () => [
      { value: "recent", label: "Mới nhất" },
      { value: "name", label: "Tên A-Z" },
      { value: "cards", label: "Số thẻ" },
      { value: "progress", label: "Tiến độ" },
    ],
    []
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ],
    []
  );

  const handleCreateFlashcard = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleExport = useCallback(() => {
    exportFlashcardSetsToPDF(flashcardSetsK, `flashcard-sets-${Date.now()}`);
  }, [flashcardSetsK, exportFlashcardSetsToPDF]);

  const handleStudyFlashcard = useCallback(
    (id: string) => {
      router.push(`/k/manage-flashcard-set/${id}`);
    },
    [router]
  );

  const handleEditFlashcard = useCallback(
    (id: string) => {
      const flashcardSet = flashcardSetsK.find((fs) => fs.id === id);
      if (flashcardSet) {
        setEditFormData({
          title: flashcardSet.title,
          description: flashcardSet.description || "",
          isPublic: flashcardSet.isPublic,
          isPinned: flashcardSet.isPinned,
          tags: flashcardSet.tags || [],
          thumbnail: flashcardSet.thumbnail || "",
        });
        setSelectedFlashcardSetId(id);
        setIsEditModalOpen(true);
      }
    },
    [flashcardSetsK]
  );

  const handleDeleteFlashcard = useCallback((id: string) => {
    setSelectedFlashcardSetId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (selectedFlashcardSetId) {
      try {
        await deleteFlashcardSet(selectedFlashcardSetId);
        setIsDeleteDialogOpen(false);
        setSelectedFlashcardSetId(null);
        // Store đã tự động xóa item và stats sẽ tự update qua useMemo
      } catch (error) {
        console.error("Delete flashcard set error:", error);
      }
    }
  }, [selectedFlashcardSetId, deleteFlashcardSet]);

  const handleCreateSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      try {
        await createFlashcardSet({
          title: data.title,
          description: data.description || "",
          isPublic: data.isPublic,
          isPinned: data.isPinned,
          tags: data.tags,
          thumbnail: data.thumbnail || null,
        });
        setIsCreateModalOpen(false);
        // Store đã tự động thêm item mới và stats sẽ tự update qua useMemo
      } catch (error) {
        console.error("Create flashcard set error:", error);
      }
    },
    [createFlashcardSet]
  );

  const handleEditSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      if (selectedFlashcardSetId) {
        try {
          await updateFlashcardSet(selectedFlashcardSetId, {
            title: data.title,
            description: data.description || "",
            isPublic: data.isPublic,
            isPinned: data.isPinned,
            tags: data.tags,
            thumbnail: data.thumbnail || null,
          });
          setIsEditModalOpen(false);
          setSelectedFlashcardSetId(null);
          setEditFormData(undefined);
          // Store đã tự động update item và stats sẽ tự update qua useMemo
        } catch (error) {
          console.error("Update flashcard set error:", error);
        }
      }
    },
    [selectedFlashcardSetId, updateFlashcardSet]
  );

  if (loading && flashcardSetsK.length === 0) {
    return <TableSkeletonLoader rows={10} />;
  }

  return (
    <>
      <FlashcardManagementTemplate
        stats={stats}
        flashcards={transformedFlashcards}
        searchQuery={searchQuery}
        sortBy={sortBy}
        statusFilter={statusFilter}
        sortOptions={sortOptions}
        statusOptions={statusOptions}
        currentPage={currentPage}
        totalPages={totalPages}
        totalResults={totalResults}
        onSearchChange={setSearchQuery}
        onSortChange={setSortBy}
        onStatusChange={setStatusFilter}
        onCreateFlashcard={handleCreateFlashcard}
        onExport={handleExport}
        onStudyFlashcard={handleStudyFlashcard}
        onEditFlashcard={handleEditFlashcard}
        onDeleteFlashcard={handleDeleteFlashcard}
        onPageChange={setCurrentPage}
      />

      {/* Create Flashcard Set Modal/Drawer */}
      <FlashcardSetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        isLoading={loading}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Flashcard Set Modal/Drawer */}
      <FlashcardSetModal
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
        title="Xác nhận xóa flashcard set"
        description="Bạn có chắc chắn muốn xóa bộ flashcard này? Tất cả thẻ trong bộ sẽ bị xóa. Hành động này không thể hoàn tác."
        isLoading={loading}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
