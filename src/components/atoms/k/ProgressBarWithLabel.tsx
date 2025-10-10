import { Progress } from "@/components/ui/progress";
import { GradientText } from "./GradientText";
import { cn } from "@/lib/utils";

interface ProgressBarWithLabelProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
}

export function ProgressBarWithLabel({
  value,
  label = "Tiến độ hoàn thành",
  showPercentage = true,
  className,
}: ProgressBarWithLabelProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        {showPercentage && (
          <GradientText className="font-semibold">
            {value}
            %
          </GradientText>
        )}
      </div>
      <Progress value={value} className="h-2" />
    </div>
  );
}
