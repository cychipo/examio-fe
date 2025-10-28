import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  total: number;
  label?: string;
  className?: string;
}

export function ProgressCircle({
  value,
  total,
  label,
  className,
}: ProgressCircleProps) {
  return (
    <div className={cn("text-center", className)}>
      <div className="relative inline-flex h-20 w-20 items-center justify-center">
        <svg className="h-20 w-20 -rotate-90 transform">
          <circle
            className="text-muted"
            strokeWidth="6"
            stroke="currentColor"
            fill="transparent"
            r="32"
            cx="40"
            cy="40"
          />
          <circle
            className="text-green-500"
            strokeWidth="6"
            strokeLinecap="round"
            stroke="currentColor"
            fill="transparent"
            r="32"
            cx="40"
            cy="40"
            strokeDasharray={`${(value / total) * 201} 201`}
          />
        </svg>
        <span className="absolute text-xl font-bold text-foreground">
          {value}
        </span>
      </div>
      {label && (
        <p className="mt-2 text-sm font-medium text-muted-foreground">
          {label}
        </p>
      )}
    </div>
  );
}
