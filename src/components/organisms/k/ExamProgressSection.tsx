import { Card } from "@/components/ui/card";
import { ProgressCircle } from "@/components/atoms/k/ProgressCircle";

interface ExamProgress {
  answered: number;
  total: number;
  marked: number;
}

interface ExamProgressSectionProps {
  progress: ExamProgress;
}

export function ExamProgressSection({ progress }: ExamProgressSectionProps) {
  return (
    <Card className="p-6">
      <h3 className="mb-4 font-semibold text-foreground">Tiến độ làm bài</h3>
      <div className="mb-6 flex items-center justify-center">
        <ProgressCircle
          value={progress.answered}
          total={progress.total}
          label="Câu đã trả lời"
        />
      </div>
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Đã trả lời</span>
          <span className="font-semibold text-green-500">
            {progress.answered}/{progress.total}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Đánh dấu</span>
          <span className="font-semibold text-yellow-500">
            {progress.marked}
          </span>
        </div>
      </div>
    </Card>
  );
}
