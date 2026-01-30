import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface ExamManagementHeaderProps {
  onCreateExam: () => void;
}

const ExamManagementHeaderComponent = ({
  onCreateExam,
}: ExamManagementHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Quản lý đề thi</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Tạo, chỉnh sửa và quản lý các đề thi và câu hỏi của bạn
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          onClick={onCreateExam}
          className="bg-primary hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Tạo đề thi
        </Button>
      </div>
    </div>
  );
};

ExamManagementHeaderComponent.displayName = "ExamManagementHeader";

export const ExamManagementHeader = memo(ExamManagementHeaderComponent);
