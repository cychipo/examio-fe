import { FlashcardManagementHeader } from "@/components/organisms/k/FlashcardManagementHeader";
import { FlashcardStatsSection } from "@/components/organisms/k/FlashcardStatsSection";
import { FlashcardSearchFilterBar } from "@/components/organisms/k/FlashcardSearchFilterBar";
import {
  FlashcardTable,
  FlashcardTableData,
} from "@/components/organisms/k/FlashcardTable";
import { FlashcardTablePagination } from "@/components/organisms/k/FlashcardTablePagination";
import { FilterOption } from "@/components/molecules/FilterSelect";

interface FlashcardManagementTemplateProps {
  stats: {
    totalGroups: number;
    totalGroupsTrend: number;
    totalCards: number;
    totalCardsTrend: number;
    avgProgress: number;
    avgProgressTrend: number;
    studiedToday: number;
    studiedTodayTrend: number;
  };
  flashcards: FlashcardTableData[];
  searchQuery: string;
  sortBy: string;
  statusFilter: string;
  sortOptions: FilterOption[];
  statusOptions: FilterOption[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onSearchChange: (value: string) => void;
  onSortChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCreateFlashcard: () => void;
  onExport: () => void;
  onStudyFlashcard: (id: string) => void;
  onEditFlashcard: (id: string) => void;
  onDeleteFlashcard: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function FlashcardManagementTemplate({
  stats,
  flashcards,
  searchQuery,
  sortBy,
  statusFilter,
  sortOptions,
  statusOptions,
  currentPage,
  totalPages,
  totalResults,
  onSearchChange,
  onSortChange,
  onStatusChange,
  onCreateFlashcard,
  onExport,
  onStudyFlashcard,
  onManageFlashcard,
  onEditFlashcard,
  onDeleteFlashcard,
  onPageChange,
}: FlashcardManagementTemplateProps & {
  onManageFlashcard: (id: string) => void;
}) {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <FlashcardManagementHeader
          onCreateFlashcard={onCreateFlashcard}
          onExport={onExport}
        />

        <FlashcardStatsSection stats={stats} />

        <FlashcardSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          sortBy={sortBy}
          statusFilter={statusFilter}
          sortOptions={sortOptions}
          statusOptions={statusOptions}
          onSortChange={onSortChange}
          onStatusChange={onStatusChange}
        />

        <FlashcardTable
          flashcards={flashcards}
          onStudy={onStudyFlashcard}
          onManage={onManageFlashcard}
          onEdit={onEditFlashcard}
          onDelete={onDeleteFlashcard}
        />

        {totalResults > 0 && (
          <FlashcardTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalResults={totalResults}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
}
