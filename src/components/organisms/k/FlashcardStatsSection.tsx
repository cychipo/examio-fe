import { Layers, Target, TrendingUp, Clock } from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";

interface FlashcardStatsData {
  totalGroups: number;
  totalGroupsTrend: number;
  totalCards: number;
  totalCardsTrend: number;
  avgProgress: number;
  avgProgressTrend: number;
  studiedToday: number;
  studiedTodayTrend: number;
}

interface FlashcardStatsSectionProps {
  stats: FlashcardStatsData;
}

export function FlashcardStatsSection({ stats }: FlashcardStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <StatCard
        title="Tổng số nhóm"
        value={stats.totalGroups}
        icon={Layers}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100 dark:bg-blue-950"
        trend={stats.totalGroupsTrend}
      />
      <StatCard
        title="Tổng số thẻ"
        value={stats.totalCards}
        icon={Target}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100 dark:bg-purple-950"
        trend={stats.totalCardsTrend}
      />
      <StatCard
        title="Tiến độ trung bình"
        value={`${stats.avgProgress}%`}
        icon={TrendingUp}
        iconColor="text-green-600"
        iconBgColor="bg-green-100 dark:bg-green-950"
        trend={stats.avgProgressTrend}
      />
      <StatCard
        title="Học hôm nay"
        value={stats.studiedToday}
        icon={Clock}
        iconColor="text-orange-600"
        iconBgColor="bg-orange-100 dark:bg-orange-950"
        trend={stats.studiedTodayTrend}
        badge="Streak: 7 ngày 🔥"
      />
    </div>
  );
}
