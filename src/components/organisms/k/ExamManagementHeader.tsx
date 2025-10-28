import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";

interface ExamManagementHeaderProps {
  onCreateExam: () => void;
  onExport: () => void;
}

export function ExamManagementHeader({
  onCreateExam,
  onExport,
}: ExamManagementHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đề thi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo, chỉnh sửa và quản lý các đề thi và câu hỏi của bạn
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="outline" onClick={onExport}>
          <Upload className="h-4 w-4 mr-2" />
          Export
        </Button>
        <Button
          onClick={onCreateExam}
          className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo đề thi
        </Button>
      </div>
    </div>
  );
}
