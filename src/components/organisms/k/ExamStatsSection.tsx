import { memo } from "react";
import {
  FileText,
  CheckCircle,
  CircleQuestionMark,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "@/components/molecules/StatCard";

interface ExamStatsData {
  totalExams: number;
  totalExamsTrend: number;
  activeExams: number;
  activeExamsTrend: number;
  totalQuestions: number;
  totalQuestionsTrend: number;
  completionRate: number;
  completionRateTrend: number;
}

interface ExamStatsSectionProps {
  stats: ExamStatsData;
}

const ExamStatsSectionComponent = ({ stats }: ExamStatsSectionProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      <StatCard
        title="Tổng số đề"
        value={stats.totalExams}
        icon={FileText}
        iconColor="text-blue-600"
        iconBgColor="bg-blue-100 dark:bg-blue-950"
        trend={stats.totalExamsTrend}
      />
      <StatCard
        title="Đề đang hoạt động"
        value={stats.activeExams}
        icon={CheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100 dark:bg-green-950"
        trend={stats.activeExamsTrend}
      />
      <StatCard
        title="Tổng câu hỏi"
        value={stats.totalQuestions}
        icon={CircleQuestionMark}
        iconColor="text-purple-600"
        iconBgColor="bg-purple-100 dark:bg-purple-950"
        trend={stats.totalQuestionsTrend}
      />
    </div>
  );
};

ExamStatsSectionComponent.displayName = "ExamStatsSection";

export const ExamStatsSection = memo(ExamStatsSectionComponent);
