import { Layers, Target, Eye } from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";

interface FlashcardStatsData {
  totalGroups: number;
  totalGroupsTrend: number;
  totalCards: number;
  totalCardsTrend: number;
  totalViews: number;
  totalViewsTrend: number;
}

interface FlashcardStatsSectionProps {
  stats: FlashcardStatsData;
}

export function FlashcardStatsSection({ stats }: FlashcardStatsSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
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
        title="Tổng lượt xem"
        value={stats.totalViews}
        icon={Eye}
        iconColor="text-green-600"
        iconBgColor="bg-green-100 dark:bg-green-950"
        trend={stats.totalViewsTrend}
      />
    </div>
  );
}
