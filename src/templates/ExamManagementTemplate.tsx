import { ExamManagementHeader } from "@/components/organisms/k/ExamManagementHeader";
import { ExamStatsSection } from "@/components/organisms/k/ExamStatsSection";
import { ExamSearchFilterBar } from "@/components/organisms/k/ExamSearchFilterBar";
import { ExamTable, ExamTableData } from "@/components/organisms/k/ExamTable";
import { ExamTablePagination } from "@/components/organisms/k/ExamTablePagination";
import { FilterOption } from "@/components/molecules/FilterSelect";

interface ExamManagementTemplateProps {
  stats: {
    totalExams: number;
    totalExamsTrend: number;
    activeExams: number;
    activeExamsTrend: number;
    totalQuestions: number;
    totalQuestionsTrend: number;
    completionRate: number;
    completionRateTrend: number;
  };
  exams: ExamTableData[];
  searchQuery: string;
  statusFilter: string;
  categoryFilter: string;
  statusOptions: FilterOption[];
  categoryOptions: FilterOption[];
  currentPage: number;
  totalPages: number;
  totalResults: number;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCreateExam: () => void;
  onExport: () => void;
  onViewExam: (id: string) => void;
  onEditExam: (id: string) => void;
  onDeleteExam: (id: string) => void;
  onPageChange: (page: number) => void;
}

export function ExamManagementTemplate({
  stats,
  exams,
  searchQuery,
  statusFilter,
  categoryFilter,
  statusOptions,
  categoryOptions,
  currentPage,
  totalPages,
  totalResults,
  onSearchChange,
  onStatusChange,
  onCategoryChange,
  onCreateExam,
  onExport,
  onViewExam,
  onEditExam,
  onDeleteExam,
  onPageChange,
}: ExamManagementTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <ExamManagementHeader onCreateExam={onCreateExam} onExport={onExport} />

        <ExamStatsSection stats={stats} />

        <ExamSearchFilterBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          categoryFilter={categoryFilter}
          statusOptions={statusOptions}
          categoryOptions={categoryOptions}
          onStatusChange={onStatusChange}
          onCategoryChange={onCategoryChange}
        />

        <ExamTable
          exams={exams}
          onView={onViewExam}
          onEdit={onEditExam}
          onDelete={onDeleteExam}
        />

        {totalResults > 0 && (
          <ExamTablePagination
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
