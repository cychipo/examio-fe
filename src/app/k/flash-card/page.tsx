"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FlashcardManagementTemplate } from "@/templates/FlashcardManagementTemplate";
import type { FlashcardTableData } from "@/components/organisms/k/FlashcardTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

// Mock data
const mockFlashcards: FlashcardTableData[] = [
  {
    id: "1",
    icon: "🤖",
    name: "Introduction to Machine Learning",
    fileName: "Introduction to Machine Learning",
    description: "AI fundamentals and ML algorithms",
    cardCount: 45,
    status: "public" as ExamStatus,
    createdDate: "15 Th01, 2024",
    createdAt: "15 Th01, 2024",
    lastStudied: "20 Th01, 2024",
    tags: ["AI", "Machine Learning"],
  },
  {
    id: "2",
    icon: "⚛️",
    name: "React Hooks Complete Guide",
    fileName: "React Hooks Complete Guide",
    description: "Modern React development patterns",
    cardCount: 32,
    status: "public" as ExamStatus,
    createdDate: "14 Th01, 2024",
    createdAt: "14 Th01, 2024",
    lastStudied: "19 Th01, 2024",
    tags: ["React", "Frontend"],
  },
  {
    id: "3",
    icon: "💾",
    name: "Database Design Principles",
    fileName: "Database Design Principles",
    description: "Relational and NoSQL databases",
    cardCount: 28,
    status: "private" as ExamStatus,
    createdDate: "13 Th01, 2024",
    createdAt: "13 Th01, 2024",
    lastStudied: "18 Th01, 2024",
    tags: ["Database", "SQL"],
  },
  {
    id: "4",
    icon: "📘",
    name: "Advanced TypeScript Patterns",
    fileName: "Advanced TypeScript Patterns",
    description: "Type system and advanced features",
    cardCount: 56,
    status: "public" as ExamStatus,
    createdDate: "12 Th01, 2024",
    createdAt: "12 Th01, 2024",
    lastStudied: "17 Th01, 2024",
    tags: ["TypeScript", "Programming"],
  },
  {
    id: "5",
    icon: "🔒",
    name: "Web Security Best Practices",
    fileName: "Web Security Best Practices",
    description: "Authentication, encryption & HTTPS",
    cardCount: 41,
    status: "private" as ExamStatus,
    createdDate: "11 Th01, 2024",
    createdAt: "11 Th01, 2024",
    lastStudied: "16 Th01, 2024",
    tags: ["Security", "Web Dev"],
  },
  {
    id: "6",
    icon: "🏗️",
    name: "System Design Interview Prep",
    fileName: "System Design Interview Prep",
    description: "Scalable architecture patterns",
    cardCount: 67,
    status: "public" as ExamStatus,
    createdDate: "10 Th01, 2024",
    createdAt: "10 Th01, 2024",
    lastStudied: null,
    tags: ["System Design", "Interview"],
  },
];

export default function FlashcardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const totalCards = mockFlashcards.reduce(
    (sum, group) => sum + group.cardCount,
    0
  );
  const avgProgress = Math.round(
    mockFlashcards.reduce((sum, group) => sum + group.cardCount, 0) /
      mockFlashcards.length
  );

  const stats = {
    totalGroups: mockFlashcards.length,
    totalGroupsTrend: 12,
    totalCards,
    totalCardsTrend: 15,
    avgProgress,
    avgProgressTrend: 8,
    studiedToday: 3,
    studiedTodayTrend: 2,
  };

  const sortOptions = [
    { value: "recent", label: "Mới nhất" },
    { value: "name", label: "Tên A-Z" },
    { value: "cards", label: "Số thẻ" },
    { value: "progress", label: "Tiến độ" },
  ];

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const totalResults = mockFlashcards.length;
  const totalPages = Math.ceil(totalResults / 10);

  const handleCreateFlashcard = () => {
    router.push("/k/ai-tool");
  };

  const handleExport = () => {
    console.log("Export flashcards");
  };

  const handleStudyFlashcard = (id: string) => {
    console.log("Study flashcard:", id);
  };

  const handleEditFlashcard = (id: string) => {
    console.log("Edit flashcard:", id);
  };

  const handleDeleteFlashcard = (id: string) => {
    console.log("Delete flashcard:", id);
  };

  return (
    <FlashcardManagementTemplate
      stats={stats}
      flashcards={mockFlashcards}
      searchQuery={searchQuery}
      sortBy={sortBy}
      statusFilter={statusFilter}
      sortOptions={sortOptions}
      statusOptions={statusOptions}
      currentPage={currentPage}
      totalPages={totalPages}
      totalResults={totalResults}
      onSearchChange={setSearchQuery}
      onSortChange={setSortBy}
      onStatusChange={setStatusFilter}
      onCreateFlashcard={handleCreateFlashcard}
      onExport={handleExport}
      onStudyFlashcard={handleStudyFlashcard}
      onEditFlashcard={handleEditFlashcard}
      onDeleteFlashcard={handleDeleteFlashcard}
      onPageChange={setCurrentPage}
    />
  );
}
