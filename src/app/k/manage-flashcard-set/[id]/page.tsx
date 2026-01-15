"use client";

import { use, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useFlashcardSetStore } from "@/stores/useFlashcardSetStore";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen,
  Plus,
  ArrowLeft,
  Settings,
  Share2,
  Trash2,
  Edit2,
  Eye,
  MoreVertical,
  CheckCircle2,
  CreditCard,
  Edit,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Flashcard as FlashCard } from "@/types/flashcardSet";
import { DeleteConfirmDialog } from "@/components/organisms/DeleteConfirmDialog";
import { FlashcardEditorDialog } from "@/components/organisms/FlashcardEditorDialog";
import { FlashcardLabelManager } from "@/components/organisms/FlashcardLabelManager";
import { RichTextViewer } from "@/components/molecules/RichTextViewer";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getFlashcardSetFlashcardsApi,
  getFlashcardSetLabelsApi,
  type PaginationInfo,
  type FlashcardSetLabel,
} from "@/apis/flashcardSetApi";

/**
 * Flashcard Set Detail Page
 * Hiển thị chi tiết bộ flashcard và danh sách thẻ
 * Cho phép thêm, sửa, xóa flashcard với inline form
 */
export default function FlashcardSetDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const {
    currentFlashcardSet,
    loading,
    fetchFlashcardSetById,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
  } = useFlashcardSetStore();

  // States
  const [selectedCard, setSelectedCard] = useState<FlashCard | null>(null);
  const [showCardForm, setShowCardForm] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Pagination state - now fetched from backend
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedFlashcards, setPaginatedFlashcards] = useState<FlashCard[]>(
    []
  );
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [flashcardsLoading, setFlashcardsLoading] = useState(false);
  const itemsPerPage = 9;

  // Label filtering state
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [availableLabels, setAvailableLabels] = useState<FlashcardSetLabel[]>(
    []
  );
  const [labelsLoading, setLabelsLoading] = useState(false);

  // Fetch flashcard set by ID (basic info only)
  useEffect(() => {
    if (id) {
      fetchFlashcardSetById(id);
    }
  }, [id, fetchFlashcardSetById]);

  // Fetch paginated flashcards from backend
  const fetchFlashcards = useCallback(async () => {
    if (!id) return;

    setFlashcardsLoading(true);
    try {
      const response = await getFlashcardSetFlashcardsApi(
        id,
        currentPage,
        itemsPerPage,
        selectedLabelId
      );
      setPaginatedFlashcards(response.flashCards);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch flashcards:", error);
    } finally {
      setFlashcardsLoading(false);
    }
  }, [id, currentPage, itemsPerPage, selectedLabelId]);

  // Fetch available labels
  const fetchLabels = useCallback(async () => {
    if (!id) return;

    setLabelsLoading(true);
    try {
      const response = await getFlashcardSetLabelsApi(id);
      setAvailableLabels(response.labels);
    } catch (error) {
      console.error("Failed to fetch labels:", error);
    } finally {
      setLabelsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  // Derived values from pagination
  const totalFlashcards = pagination?.total || 0;
  const totalPages = pagination?.totalPages || 0;

  // Handlers
  const handleAddCard = useCallback(() => {
    setSelectedCard(null);
    setShowCardForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleEditCard = useCallback((card: FlashCard) => {
    setSelectedCard(card);
    setShowCardForm(true);
    // Scroll to top to show form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleDeleteCard = useCallback((cardId: string) => {
    setCardToDelete(cardId);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (cardToDelete && id) {
      await deleteFlashcard(id, cardToDelete);
      setIsDeleteDialogOpen(false);
      setCardToDelete(null);
      // Refetch flashcards after delete
      // If current page has no items, go back to previous page
      if (paginatedFlashcards.length === 1 && currentPage > 1) {
        setCurrentPage((prev) => prev - 1);
      } else {
        fetchFlashcards();
      }
    }
  }, [
    cardToDelete,
    id,
    deleteFlashcard,
    paginatedFlashcards.length,
    currentPage,
    fetchFlashcards,
  ]);

  const handleSaveCard = useCallback(
    async (cardData: any) => {
      if (!id) return;

      if (selectedCard) {
        // Update existing flashcard
        await updateFlashcard(id, selectedCard.id, cardData);
      } else {
        // Add new flashcard
        await addFlashcard(id, cardData);
      }
      setShowCardForm(false);
      setSelectedCard(null);
      // Refetch flashcards to get updated list
      fetchFlashcards();
    },
    [selectedCard, id, addFlashcard, updateFlashcard, fetchFlashcards]
  );

  // Loading state
  if (loading || !currentFlashcardSet) {
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
          <div className="flex items-center gap-4 mb-4">
            <div className="flex-1">
              <Breadcrumb className="mb-3">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/k/flash-card">Quản lý Flashcard</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{currentFlashcardSet.title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
              {currentFlashcardSet.description && (
                <p className="text-muted-foreground mt-1">
                  {currentFlashcardSet.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
            </div>
          </div>

          {/* Tags */}
          {currentFlashcardSet.tags && currentFlashcardSet.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentFlashcardSet.tags.map((tag: string) => (
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
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Tổng số thẻ
                </p>
                <p className="text-2xl font-bold">{totalFlashcards}</p>
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
                <p className="text-2xl font-bold">{currentFlashcardSet.viewCount}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Ngày tạo
                </p>
                <p className="text-sm font-medium">
                  {new Date(currentFlashcardSet.createdAt).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Label Manager */}
        <FlashcardLabelManager flashcardSetId={id} />

        {/* Flashcard Editor Dialog */}
        <FlashcardEditorDialog
          open={showCardForm}
          onOpenChange={setShowCardForm}
          flashcard={selectedCard}
          onSave={handleSaveCard}
        />

        {/* Flashcards List */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              Danh sách thẻ nhớ
              {totalFlashcards > 0 && (
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  ({totalFlashcards} thẻ)
                </span>
              )}
            </h2>
            <Button onClick={handleAddCard} disabled={showCardForm}>
              <Plus className="mr-2 h-4 w-4" />
              Thêm thẻ
            </Button>
          </div>

          {/* Label Filter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Lọc theo nhãn:</span>
              <Select
                value={selectedLabelId || "all"}
                onValueChange={(value) => {
                  setSelectedLabelId(value === "all" ? null : value);
                  setCurrentPage(1); // Reset to first page when filter changes
                }}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Chọn nhãn" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả thẻ</SelectItem>
                  <SelectItem value="unlabeled">Chưa gán nhãn</SelectItem>
                  {availableLabels.map((label) => (
                    <SelectItem key={label.id} value={label.id}>
                      <div className="flex items-center gap-2">
                        {label.color && (
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: label.color }}
                          />
                        )}
                        {label.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {flashcardsLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : paginatedFlashcards && paginatedFlashcards.length > 0 ? (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {paginatedFlashcards.map((card, index) => {
                  // Calculate actual index across all pages
                  const actualIndex = (currentPage - 1) * itemsPerPage + index;
                  return (
                    <Card
                      key={card.id}
                      className="p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              Thẻ {actualIndex + 1}
                            </Badge>
                            {card.label && (
                              <Badge
                                variant="secondary"
                                className="text-xs"
                                style={{
                                  backgroundColor: card.label.color
                                    ? `${card.label.color}20`
                                    : undefined,
                                  borderColor: card.label.color || undefined,
                                }}
                              >
                                {card.label.color && (
                                  <div
                                    className="w-2 h-2 rounded-full mr-1"
                                    style={{
                                      backgroundColor: card.label.color,
                                    }}
                                  />
                                )}
                                {card.label.name}
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCard(card)}
                              disabled={showCardForm}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCard(card.id)}
                              disabled={showCardForm}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Câu hỏi:
                            </p>
                            <div className="font-medium text-sm">
                              <RichTextViewer content={card.question} />
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">
                              Trả lời:
                            </p>
                            <div className="text-sm text-muted-foreground">
                              <RichTextViewer content={card.answer} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(currentPage - 1) * itemsPerPage + 1} -{" "}
                    {Math.min(currentPage * itemsPerPage, totalFlashcards)} /{" "}
                    {totalFlashcards} thẻ
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
                        }
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
              <CreditCard className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Chưa có thẻ nhớ nào</p>
              <p className="text-sm mt-2">
                Nhấn "Thêm thẻ" để bắt đầu tạo bộ flashcard
              </p>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Xóa thẻ nhớ"
        description="Bạn có chắc chắn muốn xóa thẻ nhớ này? Hành động này không thể hoàn tác."
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
