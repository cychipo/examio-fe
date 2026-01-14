import { HistoryStatsGrid } from "@/components/organisms/k/HistoryStatsGrid";
import { PDFHistoryListSection } from "@/components/organisms/k/PDFHistoryListSection";
import { ExamHistoryListSection } from "@/components/organisms/k/ExamHistoryListSection";
import { RecentActivitySection } from "@/components/organisms/k/RecentActivitySection";
import type { PDFHistoryListItemData } from "@/components/molecules/PDFHistoryListItem";
import type { ExamHistoryListItemData } from "@/components/molecules/ExamHistoryListItem";
import type { RecentActivityItemData } from "@/components/molecules/RecentActivityItem";

interface HistoryStats {
  totalPDFs: number;
  examsCreated: number;
  flashcardSets: number;
  totalStudyHours: number;
}

interface HistoryTemplateProps {
  stats: HistoryStats;
  pdfItems: PDFHistoryListItemData[];
  examItems: ExamHistoryListItemData[];
  activities: RecentActivityItemData[];
  onPdfDownload?: (id: string) => void;
  onPdfDelete?: (id: string) => void;
  onExamClick?: (id: string) => void;
  showPdfHistory?: boolean;
  showExamHistory?: boolean;
}

export function HistoryTemplate({
  stats,
  pdfItems,
  examItems,
  activities,
  onPdfDownload,
  onPdfDelete,
  onExamClick,
  showPdfHistory = true,
  showExamHistory = true,
}: HistoryTemplateProps) {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pt-8 pb-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý lịch sử</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi tiến độ và hoạt động học tập của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <HistoryStatsGrid stats={stats} />

      {/* Recent Activity Section */}
      <RecentActivitySection activities={activities} />

      {/* Two Column Layout: PDF History + Exam History */}
      <div className={`grid gap-6 ${showPdfHistory && showExamHistory ? 'lg:grid-cols-2' : 'lg:grid-cols-1'}`}>
        {showPdfHistory && (
          <PDFHistoryListSection
            items={pdfItems}
            onDownload={onPdfDownload}
            onDelete={onPdfDelete}
          />
        )}
        {showExamHistory && (
          <ExamHistoryListSection
            items={examItems}
            onClick={onExamClick}
          />
        )}
      </div>


    </div>
  );
}
