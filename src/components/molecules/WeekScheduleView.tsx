import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScheduleClassItem } from "@/components/atoms/k/ScheduleClassItem";
import { cn } from "@/lib/utils";

export interface WeekScheduleClass {
  id: string;
  time: string;
  subject: string;
  location: string;
  type: "class" | "lab" | "study" | "task";
  day: string; // "Mon", "Tue", etc.
}

interface WeekScheduleViewProps {
  weekClasses: WeekScheduleClass[];
  className?: string;
}

const daysOfWeek = [
  { key: "Mon", label: "Thứ 2" },
  { key: "Tue", label: "Thứ 3" },
  { key: "Wed", label: "Thứ 4" },
  { key: "Thu", label: "Thứ 5" },
  { key: "Fri", label: "Thứ 6" },
  { key: "Sat", label: "Thứ 7" },
  { key: "Sun", label: "CN" },
];

export function WeekScheduleView({
  weekClasses,
  className,
}: WeekScheduleViewProps) {
  const classesByDay = weekClasses.reduce((acc, classItem) => {
    if (!acc[classItem.day]) {
      acc[classItem.day] = [];
    }
    acc[classItem.day].push(classItem);
    return acc;
  }, {} as Record<string, WeekScheduleClass[]>);

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      {daysOfWeek.map((day) => {
        const dayClasses = classesByDay[day.key] || [];

        return (
          <Card key={day.key} className="p-4">
            <h3 className="mb-3 text-sm font-semibold text-foreground">
              {day.label}
            </h3>
            <div className="space-y-2">
              {dayClasses.length > 0 ? (
                dayClasses.map((classItem) => (
                  <ScheduleClassItem
                    key={classItem.id}
                    time={classItem.time}
                    subject={classItem.subject}
                    location={classItem.location}
                    type={classItem.type}
                  />
                ))
              ) : (
                <p className="py-4 text-center text-xs text-muted-foreground">
                  Không có lịch
                </p>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
