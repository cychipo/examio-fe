"use client";

import { useState } from "react";
import { ExamManagementTemplate } from "@/templates/ExamManagementTemplate";
import type { ExamTableData } from "@/components/organisms/k/ExamTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";

// Mock data
const mockExams: ExamTableData[] = [
  {
    id: "1",
    icon: "📘",
    name: "Toán học nâng cao",
    description: "Calculus and Linear Algebra",
    questionCount: 45,
    status: "public" as ExamStatus,
    createdDate: "Oct 15, 2024",
    lastStudied: "2 ngày trước",
    tags: ["Toán học", "Giải tích"],
  },
  {
    id: "2",
    icon: "🧪",
    name: "Kiến thức cơ bản về Hóa học",
    description: "Periodic Table and Reactions",
    questionCount: 32,
    status: "private" as ExamStatus,
    createdDate: "Oct 12, 2024",
    lastStudied: "1 tuần trước",
    tags: ["Hóa học", "Phản ứng"],
  },
  {
    id: "3",
    icon: "📜",
    name: "Lịch sử Thế giới",
    description: "Ancient to Modern Times",
    questionCount: 28,
    status: "public" as ExamStatus,
    createdDate: "Oct 10, 2024",
    lastStudied: null,
    tags: ["Lịch sử", "Thế giới"],
  },
];

export default function ManageExamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const stats = {
    totalExams: 24,
    totalExamsTrend: 12,
    activeExams: 18,
    activeExamsTrend: 8,
    totalQuestions: 486,
    totalQuestionsTrend: 24,
    completionRate: 87,
    completionRateTrend: 5,
  };

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
    { value: "draft", label: "Draft" },
  ];

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "math", label: "Toán học" },
    { value: "physics", label: "Vật lý" },
    { value: "chemistry", label: "Hóa học" },
    { value: "english", label: "Tiếng Anh" },
    { value: "history", label: "Lịch sử" },
  ];

  const totalResults = mockExams.length;
  const totalPages = Math.ceil(totalResults / 10);

  const handleCreateExam = () => {
    console.log("Create new exam");
  };

  const handleExport = () => {
    console.log("Export exams");
  };

  const handleViewExam = (id: string) => {
    console.log("View exam:", id);
  };

  const handleEditExam = (id: string) => {
    console.log("Edit exam:", id);
  };

  const handleDeleteExam = (id: string) => {
    console.log("Delete exam:", id);
  };

  return (
    <ExamManagementTemplate
      stats={stats}
      exams={mockExams}
      searchQuery={searchQuery}
      statusFilter={statusFilter}
      categoryFilter={categoryFilter}
      statusOptions={statusOptions}
      categoryOptions={categoryOptions}
      currentPage={currentPage}
      totalPages={totalPages}
      totalResults={totalResults}
      onSearchChange={setSearchQuery}
      onStatusChange={setStatusFilter}
      onCategoryChange={setCategoryFilter}
      onCreateExam={handleCreateExam}
      onExport={handleExport}
      onViewExam={handleViewExam}
      onEditExam={handleEditExam}
      onDeleteExam={handleDeleteExam}
      onPageChange={setCurrentPage}
    />
  );
}
