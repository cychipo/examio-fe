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
        iconClassName="bg-red-100 text-primary"
      />
      <HistoryStatCard
        title="Đề thi đã tạo"
        value={stats.examsCreated}
        icon={ClipboardList}
        iconClassName="bg-yellow-100 text-yellow-600"
      />
      <HistoryStatCard
        title="Bộ Flashcard"
        value={stats.flashcardSets}
        icon={BookOpen}
        iconClassName="bg-yellow-100 text-yellow-600"
      />
      <HistoryStatCard
        title="Giờ học tổng cộng"
        value={stats.totalStudyHours}
        icon={Clock}
        iconClassName="bg-orange-100 text-orange-600"
      />
    </div>
  );
}
