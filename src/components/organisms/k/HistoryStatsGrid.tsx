import { HistoryStatCard } from "@/components/molecules/HistoryStatCard";
import { FileText, BookOpen, Award, TrendingUp } from "lucide-react";

interface HistoryStats {
  totalPDFs: number;
  totalExams: number;
  averageScore: number;
  passRate: number;
}

interface HistoryStatsGridProps {
  stats: HistoryStats;
}

export function HistoryStatsGrid({ stats }: HistoryStatsGridProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <HistoryStatCard
        title="Tổng số PDF"
        value={stats.totalPDFs}
        icon={FileText}
        description="Đã tải lên"
        iconClassName="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
      />
      <HistoryStatCard
        title="Số bài thi"
        value={stats.totalExams}
        icon={BookOpen}
        description="Đã hoàn thành"
        iconClassName="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
      />
      <HistoryStatCard
        title="Điểm trung bình"
        value={stats.averageScore.toFixed(1)}
        icon={Award}
        description="Trên thang điểm 10"
        trend={{
          value: 12,
          isPositive: true,
        }}
        iconClassName="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400"
      />
      <HistoryStatCard
        title="Tỷ lệ đạt"
        value={`${stats.passRate}%`}
        icon={TrendingUp}
        description="Số bài đạt/tổng số bài"
        trend={{
          value: 8,
          isPositive: true,
        }}
        iconClassName="bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
      />
    </div>
  );
}
