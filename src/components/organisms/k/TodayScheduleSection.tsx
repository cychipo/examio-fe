import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScheduleClassItem } from "@/components/atoms/k/ScheduleClassItem";
import {
  WeekScheduleView,
  type WeekScheduleClass,
} from "@/components/molecules/WeekScheduleView";

export interface ScheduleClass {
  id: string;
  time: string;
  subject: string;
  location: string;
  type: "class" | "lab" | "study" | "task";
  day?: string; // For week view
}

interface TodayScheduleSectionProps {
  classes: ScheduleClass[];
  weekClasses: WeekScheduleClass[];
  viewMode: "day" | "week";
  onViewModeChange: (mode: "day" | "week") => void;
}

export function TodayScheduleSection({
  classes,
  weekClasses,
  viewMode,
  onViewModeChange,
}: TodayScheduleSectionProps) {
  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">
          {viewMode === "day" ? "Lịch học hôm nay" : "Lịch học tuần này"}
        </h2>
        <Tabs
          value={viewMode}
          onValueChange={(v) => onViewModeChange(v as "day" | "week")}>
          <TabsList>
            <TabsTrigger value="day">Ngày</TabsTrigger>
            <TabsTrigger value="week">Tuần</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "day" ? (
        <div className="space-y-3">
          {classes.map((classItem) => (
            <ScheduleClassItem
              key={classItem.id}
              time={classItem.time}
              subject={classItem.subject}
              location={classItem.location}
              type={classItem.type}
            />
          ))}
          {classes.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">
                Không có lịch học nào hôm nay
              </p>
            </div>
          )}
        </div>
      ) : (
        <WeekScheduleView weekClasses={weekClasses} />
      )}
    </Card>
  );
}
