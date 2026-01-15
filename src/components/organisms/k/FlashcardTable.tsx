import { Eye, PlayCircle, Share2 } from "lucide-react";
import { ManagementTable, ManagementTableData } from "./ManagementTable";
import { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

export interface FlashcardTableData {
  id: string;
  icon: string;
  thumbnail?: string | null;
  name: string;
  description: string;
  cardCount: number;
  viewCount: number;
  status: ExamStatus;
  createdDate: string;
  lastStudied: string | null;
  tags: string[];
  fileName?: string;
  createdAt?: string;
}

interface FlashcardTableProps {
  flashcards: FlashcardTableData[];
  onManage: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function FlashcardTable({
  flashcards,
  onManage,
  onEdit,
  onDelete,
  onShare,
}: FlashcardTableProps) {
  const tableData: ManagementTableData[] = flashcards.map((flashcard) => ({
    id: flashcard.id,
    icon: flashcard.icon,
    thumbnail: flashcard.thumbnail,
    name: flashcard.name,
    description: flashcard.description,
    questionCount: flashcard.cardCount,
    viewCount: flashcard.viewCount,
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
      primaryActionIcon={Eye}
      primaryActionLabel="Chi tiết"
      shareActionIcon={Share2}
      shareActionLabel="Chia sẻ"
      countColumnLabel="Số thẻ"
      onPrimaryAction={onManage}
      onShare={onShare}
      onEdit={onEdit}
      onDelete={onDelete}
      emptyMessage="Không có bộ thẻ nào"
    />
  );
}
