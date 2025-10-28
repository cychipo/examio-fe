import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleCalendarProps {
  currentMonth: string;
  currentYear: number;
  selectedDate?: number;
  onDateSelect?: (date: number) => void;
  onPrevMonth?: () => void;
  onNextMonth?: () => void;
}

export function ScheduleCalendar({
  currentMonth,
  currentYear,
  selectedDate = 28,
  onDateSelect,
  onPrevMonth,
  onNextMonth,
}: ScheduleCalendarProps) {
  const daysInMonth = new Date(
    currentYear,
    getMonthNumber(currentMonth) + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentYear,
    getMonthNumber(currentMonth),
    1
  ).getDay();

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  return (
    <Card className="p-4">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">
          {currentMonth} {currentYear}
        </h3>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onPrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {["CN", "T2", "T3", "T4", "T5", "T6", "T7"].map((day) => (
          <div
            key={day}
            className="flex h-8 items-center justify-center text-xs font-medium text-muted-foreground">
            {day}
          </div>
        ))}

        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="h-8" />
        ))}

        {days.map((day) => {
          const isSelected = day === selectedDate;
          const isToday = day === selectedDate; // Simplified for demo

          return (
            <button
              key={day}
              onClick={() => onDateSelect?.(day)}
              className={cn(
                "flex h-8 items-center justify-center rounded-md text-sm transition-colors hover:bg-muted",
                isSelected && "bg-blue-500 text-white hover:bg-blue-600",
                !isSelected && isToday && "font-semibold"
              )}>
              {day}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function getMonthNumber(monthName: string): number {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months.indexOf(monthName);
}
