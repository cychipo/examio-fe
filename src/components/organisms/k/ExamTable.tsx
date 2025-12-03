import { memo } from "react";
import { Eye, PlayCircle } from "lucide-react";
import { ManagementTable, ManagementTableData } from "./ManagementTable";
import { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

export interface ExamTableData {
  id: string;
  icon: string;
  thumbnail?: string | null;
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
  onPractice: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

const ExamTableComponent = ({
  exams,
  onView,
  onPractice,
  onEdit,
  onDelete,
}: ExamTableProps) => {
  const tableData: ManagementTableData[] = exams.map((exam) => ({
    id: exam.id,
    icon: exam.icon,
    thumbnail: exam.thumbnail,
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
      primaryActionIcon={PlayCircle}
      primaryActionLabel="Thi thử"
      secondaryActionIcon={Eye}
      secondaryActionLabel="Xem chi tiết"
      countColumnLabel="Số câu hỏi"
      onPrimaryAction={onPractice}
      onSecondaryAction={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có đề thi nào"
    />
  );
};

ExamTableComponent.displayName = "ExamTable";

export const ExamTable = memo(ExamTableComponent);
