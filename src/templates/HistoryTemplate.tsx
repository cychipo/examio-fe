import { HistoryStatsGrid } from "@/components/organisms/k/HistoryStatsGrid";
import { PDFHistorySection } from "@/components/organisms/k/PDFHistorySection";
import { ExamHistorySection } from "@/components/organisms/k/ExamHistorySection";
import type { PDFHistoryItem } from "@/components/molecules/PDFHistoryCard";
import type { ExamHistoryItem } from "@/components/molecules/ExamHistoryCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HistoryStats {
  totalPDFs: number;
  totalExams: number;
  averageScore: number;
  passRate: number;
}

interface HistoryTemplateProps {
  stats: HistoryStats;
  pdfItems: PDFHistoryItem[];
  examItems: ExamHistoryItem[];
  pdfSearchValue: string;
  onPdfSearchChange: (value: string) => void;
  pdfFilterValue: string;
  onPdfFilterChange: (value: string) => void;
  examSearchValue: string;
  onExamSearchChange: (value: string) => void;
  examFilterValue: string;
  onExamFilterChange: (value: string) => void;
  onPdfDownload?: (id: string) => void;
  onPdfDelete?: (id: string) => void;
}

export function HistoryTemplate({
  stats,
  pdfItems,
  examItems,
  pdfSearchValue,
  onPdfSearchChange,
  pdfFilterValue,
  onPdfFilterChange,
  examSearchValue,
  onExamSearchChange,
  examFilterValue,
  onExamFilterChange,
  onPdfDownload,
  onPdfDelete,
}: HistoryTemplateProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Lịch sử</h1>
        <p className="text-muted-foreground mt-1">
          Theo dõi lịch sử tải lên PDF và kết quả làm bài thi của bạn
        </p>
      </div>

      {/* Stats Grid */}
      <HistoryStatsGrid stats={stats} />

      {/* History Sections with Tabs */}
      <Tabs defaultValue="pdf" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pdf">Lịch sử PDF</TabsTrigger>
          <TabsTrigger value="exam">Lịch sử thi</TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-6">
          <PDFHistorySection
            items={pdfItems}
            searchValue={pdfSearchValue}
            onSearchChange={onPdfSearchChange}
            filterValue={pdfFilterValue}
            onFilterChange={onPdfFilterChange}
            onDownload={onPdfDownload}
            onDelete={onPdfDelete}
          />
        </TabsContent>

        <TabsContent value="exam" className="mt-6">
          <ExamHistorySection
            items={examItems}
            searchValue={examSearchValue}
            onSearchChange={onExamSearchChange}
            filterValue={examFilterValue}
            onFilterChange={onExamFilterChange}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
