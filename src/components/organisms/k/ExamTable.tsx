import { Play } from "lucide-react";
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

export function ExamTable({ exams, onView, onEdit, onDelete }: ExamTableProps) {
  const tableData: ManagementTableData[] = exams.map((exam) => ({
    id: exam.id,
    icon: exam.icon,
    name: exam.name,
    description: exam.description,
    count: exam.questionCount,
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
      primaryActionIcon={Play}
      primaryActionLabel="Làm bài"
      countColumnLabel="Số câu hỏi"
      onPrimaryAction={onView}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có đề thi nào"
    />
  );
}
