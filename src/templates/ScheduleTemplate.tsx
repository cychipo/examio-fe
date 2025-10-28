import { ScheduleStatsSection } from "@/components/organisms/k/ScheduleStatsSection";
import {
  TodayScheduleSection,
  type ScheduleClass,
} from "@/components/organisms/k/TodayScheduleSection";
import {
  UpcomingExamsSection,
  type UpcomingExam,
} from "@/components/organisms/k/UpcomingExamsSection";
import {
  QuickTasksSection,
  type Task,
} from "@/components/organisms/k/QuickTasksSection";
import { ScheduleCalendar } from "@/components/molecules/ScheduleCalendar";
import type { WeekScheduleClass } from "@/components/molecules/WeekScheduleView";

interface ScheduleStats {
  todayClasses: number;
  pendingTasks: number;
  upcomingExams: number;
  completed: number;
}

interface ScheduleTemplateProps {
  stats: ScheduleStats;
  classes: ScheduleClass[];
  weekClasses: WeekScheduleClass[];
  exams: UpcomingExam[];
  tasks: Task[];
  viewMode: "day" | "week";
  currentMonth: string;
  currentYear: number;
  selectedDate: number;
  onViewModeChange: (mode: "day" | "week") => void;
  onTaskToggle: (id: string, checked: boolean) => void;
  onDateSelect: (date: number) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export function ScheduleTemplate({
  stats,
  classes,
  weekClasses,
  exams,
  tasks,
  viewMode,
  currentMonth,
  currentYear,
  selectedDate,
  onViewModeChange,
  onTaskToggle,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}: ScheduleTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Section */}
        <div className="mb-6">
          <ScheduleStatsSection stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column - Today's Schedule (2 columns) */}
          <div className="space-y-6 lg:col-span-2">
            <TodayScheduleSection
              classes={classes}
              weekClasses={weekClasses}
              viewMode={viewMode}
              onViewModeChange={onViewModeChange}
            />
          </div>

          {/* Right Column - Upcoming Exams (1 column) */}
          <div className="space-y-6 lg:col-span-1">
            <UpcomingExamsSection exams={exams} />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {/* Quick Tasks */}
          <div className="lg:col-span-2">
            <QuickTasksSection tasks={tasks} onTaskToggle={onTaskToggle} />
          </div>

          {/* Calendar */}
          <div className="lg:col-span-1">
            <ScheduleCalendar
              currentMonth={currentMonth}
              currentYear={currentYear}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
              onPrevMonth={onPrevMonth}
              onNextMonth={onNextMonth}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
