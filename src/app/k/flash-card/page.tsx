"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FlashcardManagementTemplate } from "@/templates/FlashcardManagementTemplate";
import type { FlashcardTableData } from "@/components/organisms/k/FlashcardTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { useStatsStore } from "@/stores/useStatsStore";
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
  const { flashcardStats, fetchFlashcardStats, invalidateFlashcardStats } =
    useStatsStore();
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

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Fetch stats using store
  useEffect(() => {
    fetchFlashcardStats();
  }, [fetchFlashcardStats]);

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
        thumbnail: set.thumbnail,
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

  // Stats object for template
  const stats = useMemo(
    () => ({
      totalGroups: flashcardStats?.totalGroups || 0,
      totalGroupsTrend: flashcardStats?.totalGroupsTrend || 0,
      totalCards: flashcardStats?.totalCards || 0,
      totalCardsTrend: flashcardStats?.totalCardsTrend || 0,
      avgProgress: flashcardStats?.avgProgress || 0,
      avgProgressTrend: flashcardStats?.avgProgressTrend || 0,
      studiedToday: flashcardStats?.studiedToday || 0,
      studiedTodayTrend: flashcardStats?.studiedTodayTrend || 0,
    }),
    [flashcardStats]
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
      router.push(`/k/study-flashcard/${id}`);
    },
    [router]
  );

  const handleManageFlashcard = useCallback(
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
        invalidateFlashcardStats(); // Invalidate stats cache
        setIsDeleteDialogOpen(false);
        setSelectedFlashcardSetId(null);
      } catch (error) {
        console.error("Delete flashcard set error:", error);
      } finally {
        await fetchFlashcardStats();
      }
    }
  }, [selectedFlashcardSetId, deleteFlashcardSet, invalidateFlashcardStats]);

  const handleCreateSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      try {
        const thumbnailFile =
          data.thumbnail instanceof File ? data.thumbnail : undefined;
        const thumbnailUrl =
          typeof data.thumbnail === "string" ? data.thumbnail : null;

        await createFlashcardSet(
          {
            title: data.title,
            description: data.description || "",
            isPublic: data.isPublic,
            isPinned: data.isPinned,
            tags: data.tags,
            thumbnail: thumbnailUrl,
          },
          thumbnailFile
        );
        invalidateFlashcardStats(); // Invalidate stats cache
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Create flashcard set error:", error);
      } finally {
        await fetchFlashcardStats();
      }
    },
    [createFlashcardSet, invalidateFlashcardStats]
  );

  const handleEditSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      if (selectedFlashcardSetId) {
        try {
          const thumbnailFile =
            data.thumbnail instanceof File ? data.thumbnail : undefined;
          const thumbnailUrl =
            typeof data.thumbnail === "string" ? data.thumbnail : null;

          await updateFlashcardSet(
            selectedFlashcardSetId,
            {
              title: data.title,
              description: data.description || "",
              isPublic: data.isPublic,
              isPinned: data.isPinned,
              tags: data.tags,
              thumbnail: thumbnailUrl,
            },
            thumbnailFile
          );
          setIsEditModalOpen(false);
          setSelectedFlashcardSetId(null);
          setEditFormData(undefined);
        } catch (error) {
          console.error("Update flashcard set error:", error);
        } finally {
          await fetchFlashcardStats();
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
        onStudyFlashcard={handleStudyFlashcard}
        onManageFlashcard={handleManageFlashcard}
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
