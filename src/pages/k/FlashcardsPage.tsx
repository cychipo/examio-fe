import { useState, useEffect, useMemo, useCallback } from "react";
import { FlashcardManagementTemplate } from "@/templates/FlashcardManagementTemplate";
import type { FlashcardTableData } from "@/components/organisms/k/FlashcardTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { useStatsStore } from "@/stores/useStatsStore";
import { useDebounce } from "@/hooks/useDebounce";
import { FlashcardSetModal } from "@/components/organisms/FlashcardSetModal";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { ShareFlashcardModal } from "@/components/organisms/ShareFlashcardModal";
import type { FlashcardSetFormData } from "@/components/molecules/FlashcardSetForm";
import { TableSkeletonLoader } from "@/components/organisms/TableSkeletonLoader";

export default function FlashcardsPage() {
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

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedFlashcardSetId, setSelectedFlashcardSetId] = useState<string | null>(null);
  const [selectedFlashcardSetTitle, setSelectedFlashcardSetTitle] = useState("");
  const [editFormData, setEditFormData] = useState<FlashcardSetFormData | undefined>(undefined);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    fetchFlashcardStats();
  }, [fetchFlashcardStats]);

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

  const transformedFlashcards: FlashcardTableData[] = useMemo(
    () =>
      flashcardSetsK.map((set) => ({
        id: set.id,
        icon: "🎴",
        thumbnail: set.thumbnail,
        name: set.title,
        fileName: set.title,
        description: set.description || "",
        cardCount: set._count?.detailsFlashCard || 0,
        viewCount: set.viewCount || 0,
        status: (set.isPublic ? "public" : "private") as ExamStatus,
        createdDate: new Date(set.createdAt).toLocaleDateString("vi-VN"),
        createdAt: set.createdAt,
        lastStudied: null,
        tags: set.tags || [],
      })),
    [flashcardSetsK],
  );

  const totalPages = Math.ceil(totalResults / limit);

  const stats = useMemo(
    () => ({
      totalGroups: flashcardStats?.totalGroups || 0,
      totalGroupsTrend: flashcardStats?.totalGroupsTrend || 0,
      totalCards: flashcardStats?.totalCards || 0,
      totalCardsTrend: flashcardStats?.totalCardsTrend || 0,
      totalViews: flashcardStats?.totalViews || 0,
      totalViewsTrend: flashcardStats?.totalViewsTrend || 0,
    }),
    [flashcardStats],
  );

  const sortOptions = useMemo(
    () => [
      { value: "recent", label: "Mới nhất" },
      { value: "name", label: "Tên A-Z" },
      { value: "cards", label: "Số thẻ" },
      { value: "views", label: "Lượt xem" },
    ],
    [],
  );

  const statusOptions = useMemo(
    () => [
      { value: "all", label: "Tất cả trạng thái" },
      { value: "public", label: "Public" },
      { value: "private", label: "Private" },
    ],
    [],
  );

  const handleCreateFlashcard = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  const handleManageFlashcard = useCallback((id: string) => {
    window.location.href = `/k/manage-flashcard-set/${id}`;
  }, []);

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
    [flashcardSetsK],
  );

  const handleDeleteFlashcard = useCallback((id: string) => {
    setSelectedFlashcardSetId(id);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleShareFlashcard = useCallback(
    (id: string) => {
      const flashcardSet = flashcardSetsK.find((fs) => fs.id === id);
      if (flashcardSet) {
        setSelectedFlashcardSetId(id);
        setSelectedFlashcardSetTitle(flashcardSet.title);
        setIsShareModalOpen(true);
      }
    },
    [flashcardSetsK],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (selectedFlashcardSetId) {
      try {
        await deleteFlashcardSet(selectedFlashcardSetId);
        invalidateFlashcardStats();
        setIsDeleteDialogOpen(false);
        setSelectedFlashcardSetId(null);
      } catch (error) {
        console.error("Delete flashcard set error:", error);
      } finally {
        await fetchFlashcardStats();
      }
    }
  }, [
    selectedFlashcardSetId,
    deleteFlashcardSet,
    invalidateFlashcardStats,
    fetchFlashcardStats,
  ]);

  const handleCreateSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      try {
        const thumbnailFile = data.thumbnail instanceof File ? data.thumbnail : undefined;
        const thumbnailUrl = typeof data.thumbnail === "string" ? data.thumbnail : null;

        await createFlashcardSet(
          {
            title: data.title,
            description: data.description || "",
            isPublic: data.isPublic,
            isPinned: data.isPinned,
            tags: data.tags,
            thumbnail: thumbnailUrl,
          },
          thumbnailFile,
        );
        invalidateFlashcardStats();
        setIsCreateModalOpen(false);
      } catch (error) {
        console.error("Create flashcard set error:", error);
      } finally {
        await fetchFlashcardStats();
      }
    },
    [createFlashcardSet, invalidateFlashcardStats, fetchFlashcardStats],
  );

  const handleEditSubmit = useCallback(
    async (data: FlashcardSetFormData) => {
      if (selectedFlashcardSetId) {
        try {
          const thumbnailFile = data.thumbnail instanceof File ? data.thumbnail : undefined;
          const thumbnailUrl = typeof data.thumbnail === "string" ? data.thumbnail : null;

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
            thumbnailFile,
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
    [selectedFlashcardSetId, updateFlashcardSet, fetchFlashcardStats],
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
        onManageFlashcard={handleManageFlashcard}
        onEditFlashcard={handleEditFlashcard}
        onDeleteFlashcard={handleDeleteFlashcard}
        onShareFlashcard={handleShareFlashcard}
        onPageChange={setCurrentPage}
      />

      <FlashcardSetModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        mode="create"
        isLoading={loading}
        onSubmit={handleCreateSubmit}
      />

      <FlashcardSetModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        mode="edit"
        initialData={editFormData}
        isLoading={loading}
        onSubmit={handleEditSubmit}
      />

      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xác nhận xóa flashcard set"
        description="Bạn có chắc chắn muốn xóa bộ flashcard này? Tất cả thẻ trong bộ sẽ bị xóa. Hành động này không thể hoàn tác."
        isLoading={loading}
        onConfirm={handleConfirmDelete}
      />

      {selectedFlashcardSetId && (
        <ShareFlashcardModal
          open={isShareModalOpen}
          onOpenChange={setIsShareModalOpen}
          flashcardSetId={selectedFlashcardSetId}
          flashcardSetTitle={selectedFlashcardSetTitle}
        />
      )}
    </>
  );
}
