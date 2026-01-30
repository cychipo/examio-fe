import { memo } from "react";
import { FileText, CheckCircle, CircleQuestionMark } from "lucide-react";
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
        iconColor="text-primary"
        iconBgColor="bg-red-100"
        trend={stats.totalExamsTrend}
      />
      <StatCard
        title="Đề đang hoạt động"
        value={stats.activeExams}
        icon={CheckCircle}
        iconColor="text-green-600"
        iconBgColor="bg-green-100"
        trend={stats.activeExamsTrend}
      />
      <StatCard
        title="Tổng câu hỏi"
        value={stats.totalQuestions}
        icon={CircleQuestionMark}
        iconColor="text-yellow-600"
        iconBgColor="bg-yellow-100"
        trend={stats.totalQuestionsTrend}
      />
    </div>
  );
};

ExamStatsSectionComponent.displayName = "ExamStatsSection";

export const ExamStatsSection = memo(ExamStatsSectionComponent);
