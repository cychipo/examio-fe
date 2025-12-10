import { SecureBadge } from "@/components/atoms/k/SecureBadge";
import { ExamMetricCard } from "@/components/molecules/ExamMetricCard";
import { Clock, FileText, Award, RotateCcw } from "lucide-react";

interface ExamInfo {
  title: string;
  subtitle: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  attempts: string;
}

interface ExamHeaderSectionProps {
  examInfo: ExamInfo;
}

export function ExamHeaderSection({ examInfo }: ExamHeaderSectionProps) {
  return (
    <div>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            {examInfo.title}
          </h1>
          <p className="mt-1 text-muted-foreground">{examInfo.subtitle}</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <ExamMetricCard
          icon={Clock}
          label="Thời gian"
          value={`${examInfo.duration} phút`}
          iconColor="text-blue-500"
          iconBgColor="bg-blue-500/10"
        />
        <ExamMetricCard
          icon={FileText}
          label="Tổng số câu hỏi"
          value={`${examInfo.totalQuestions} câu`}
          iconColor="text-purple-500"
          iconBgColor="bg-purple-500/10"
        />
        <ExamMetricCard
          icon={Award}
          label="Điểm đạt"
          value={`${examInfo.passingScore}%`}
          iconColor="text-green-500"
          iconBgColor="bg-green-500/10"
        />
        <ExamMetricCard
          icon={RotateCcw}
          label="Lượt thi"
          value={examInfo.attempts}
          iconColor="text-orange-500"
          iconBgColor="bg-orange-500/10"
        />
      </div>
    </div>
  );
}
