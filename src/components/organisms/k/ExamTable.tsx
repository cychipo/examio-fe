import { memo } from "react";
import { Eye } from "lucide-react";
import { ManagementTable, ManagementTableData } from "./ManagementTable";
import { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

export interface ExamTableData {
  id: string;
  icon: string;
  name: string;
  description: string;
  questionCount: number;
  status: ExamStatus;
  createdDate: string;
  lastStudied: string | null;
  tags: string[];
}

interface ExamTableProps {
  exams: ExamTableData[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExamTableComponent = ({
  exams,
  onView,
  onEdit,
  onDelete,
}: ExamTableProps) => {
  const tableData: ManagementTableData[] = exams.map((exam) => ({
    id: exam.id,
    icon: exam.icon,
    name: exam.name,
    description: exam.description,
    questionCount: exam.questionCount,
    countLabel: "câu hỏi",
    status: exam.status,
    createdDate: exam.createdDate,
    lastStudied: exam.lastStudied,
    tags: exam.tags,
  }));

  return (
    <ManagementTable
      title="Tất cả đề thi"
      data={tableData}
      primaryActionIcon={Eye}
      primaryActionLabel="Xem chi tiết"
      countColumnLabel="Số câu hỏi"
      onPrimaryAction={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có đề thi nào"
    />
  );
};

ExamTableComponent.displayName = "ExamTable";

export const ExamTable = memo(ExamTableComponent);
