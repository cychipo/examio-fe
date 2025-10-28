import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface CountdownTimerProps {
  hours: number;
  minutes: number;
  seconds: number;
  label?: string;
  description?: string;
  className?: string;
}

export function CountdownTimer({
  hours,
  minutes,
  seconds,
  label = "Thời gian còn lại",
  description,
  className,
}: CountdownTimerProps) {
  const timeString = `${String(hours).padStart(2, "0")}:${String(
    minutes
  ).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}>
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
        <Clock className="h-8 w-8 text-white" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-muted-foreground">{label}</p>
        <p className="mt-1 text-3xl font-bold tabular-nums text-foreground">
          {timeString}
        </p>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}
