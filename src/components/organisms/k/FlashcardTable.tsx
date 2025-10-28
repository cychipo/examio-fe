import { Play } from "lucide-react";
import { ManagementTable, ManagementTableData } from "./ManagementTable";
import { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

export interface FlashcardTableData {
  id: string;
  icon: string;
  name: string;
  description: string;
  cardCount: number;
  status: ExamStatus;
  createdDate: string;
  lastStudied: string | null;
  tags: string[];
}

interface FlashcardTableProps {
  flashcards: FlashcardTableData[];
  onStudy: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function FlashcardTable({
  flashcards,
  onStudy,
  onEdit,
  onDelete,
}: FlashcardTableProps) {
  const tableData: ManagementTableData[] = flashcards.map((flashcard) => ({
    id: flashcard.id,
    icon: flashcard.icon,
    name: flashcard.name,
    description: flashcard.description,
    count: flashcard.cardCount,
    countLabel: "thẻ",
    status: flashcard.status,
    createdDate: flashcard.createdDate,
    lastStudied: flashcard.lastStudied,
    tags: flashcard.tags,
  }));

  return (
    <ManagementTable
      title="Tất cả bộ thẻ"
      data={tableData}
      primaryActionIcon={Play}
      primaryActionLabel="Học ngay"
      countColumnLabel="Số thẻ"
      onPrimaryAction={onStudy}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có bộ thẻ nào"
    />
  );
}
