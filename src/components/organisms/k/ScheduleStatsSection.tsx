import { ScheduleStatsCard } from "@/components/molecules/ScheduleStatsCard";
import { Calendar, ListTodo, AlertCircle, CheckCircle2 } from "lucide-react";

interface ScheduleStats {
  todayClasses: number;
  pendingTasks: number;
  upcomingExams: number;
  completed: number;
}

interface ScheduleStatsSectionProps {
  stats: ScheduleStats;
}

export function ScheduleStatsSection({ stats }: ScheduleStatsSectionProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <ScheduleStatsCard
        icon={Calendar}
        label="Lớp học hôm nay"
        value={stats.todayClasses}
        iconColor="text-blue-500"
        iconBgColor="bg-blue-500/10"
      />
      <ScheduleStatsCard
        icon={ListTodo}
        label="Nhiệm vụ đang chờ"
        value={stats.pendingTasks}
        iconColor="text-orange-500"
        iconBgColor="bg-orange-500/10"
      />
      <ScheduleStatsCard
        icon={AlertCircle}
        label="Kỳ thi sắp tới"
        value={stats.upcomingExams}
        iconColor="text-red-500"
        iconBgColor="bg-red-500/10"
      />
      <ScheduleStatsCard
        icon={CheckCircle2}
        label="Đã hoàn thành"
        value={stats.completed}
        iconColor="text-green-500"
        iconBgColor="bg-green-500/10"
      />
    </div>
  );
}
