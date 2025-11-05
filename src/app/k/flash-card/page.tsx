"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FlashcardManagementTemplate } from "@/templates/FlashcardManagementTemplate";
import type { FlashcardTableData } from "@/components/organisms/k/FlashcardTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";

export default function FlashcardsPage() {
  const router = useRouter();
  const { flashcardSetsK, loading, fetchFlashcardSets } =
    useFlashcardSetStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

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
        search: searchQuery || undefined,
        isPublic,
      });

      if (response) {
        setTotalResults(response.total);
      }
    };

    loadFlashcardSets();
  }, [currentPage, searchQuery, statusFilter, fetchFlashcardSets]);

  // Transform flashcard sets to table data format
  const transformedFlashcards: FlashcardTableData[] = flashcardSetsK.map(
    (set) => ({
      id: set.id,
      icon: "🎴", // Default icon
      name: set.title,
      fileName: set.title,
      description: set.description || "",
      cardCount: 0, // Backend chưa trả về thông tin số lượng flashcard
      status: (set.isPublic ? "public" : "private") as ExamStatus,
      createdDate: new Date(set.createdAt).toLocaleDateString("vi-VN"),
      createdAt: set.createdAt,
      lastStudied: null, // Backend chưa có thông tin này
      tags: set.tags,
    })
  );

  const totalPages = Math.ceil(totalResults / limit);

  // Tính stats từ dữ liệu thực
  const stats = {
    totalGroups: totalResults,
    totalGroupsTrend: 0, // Cần API riêng để lấy trend
    totalCards: 0, // Cần tính từ tất cả các flashcard sets
    totalCardsTrend: 0,
    avgProgress: 0, // Cần API riêng để tính progress
    avgProgressTrend: 0,
    studiedToday: 0, // Cần API riêng
    studiedTodayTrend: 0,
  };

  const sortOptions = [
    { value: "recent", label: "Mới nhất" },
    { value: "name", label: "Tên A-Z" },
    { value: "cards", label: "Số thẻ" },
    { value: "progress", label: "Tiến độ" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const handleCreateFlashcard = () => {
    router.push("/k/ai-tool");
  };

  const handleExport = () => {
    console.log("Export flashcards");
  };

  const handleStudyFlashcard = (id: string) => {
    router.push(`/k/flashcard/${id}`);
  };

  const handleEditFlashcard = (id: string) => {
    router.push(`/k/flashcard/edit/${id}`);
  };

  const handleDeleteFlashcard = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bộ flashcard này?")) {
      try {
        await useFlashcardSetStore.getState().deleteFlashcardSet(id);
      } catch (error) {
        console.error("Delete flashcard error:", error);
      }
    }
  };

  if (loading && flashcardSetsK.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
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
  );
}
