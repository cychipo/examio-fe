import { HistoryStatCard } from "@/components/molecules/HistoryStatCard";
import { FileText, ClipboardList, BookOpen, Clock } from "lucide-react";

interface HistoryStats {
  totalPDFs: number;
  examsCreated: number;
  flashcardSets: number;
  totalStudyHours: number;
}

interface HistoryStatsGridProps {
  stats: HistoryStats;
}

export function HistoryStatsGrid({ stats }: HistoryStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <HistoryStatCard
        title="Tổng PDF đã xử lý"
        value={stats.totalPDFs}
        icon={FileText}
        iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <HistoryStatCard
        title="Đề thi đã tạo"
        value={stats.examsCreated}
        icon={ClipboardList}
        iconClassName="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400"
      />
      <HistoryStatCard
        title="Bộ Flashcard"
        value={stats.flashcardSets}
        icon={BookOpen}
        iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      <HistoryStatCard
        title="Giờ học tổng cộng"
        value={stats.totalStudyHours}
        icon={Clock}
        iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
      />
    </div>
  );
}
