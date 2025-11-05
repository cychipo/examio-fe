"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ExamManagementTemplate } from "@/templates/ExamManagementTemplate";
import type { ExamTableData } from "@/components/organisms/k/ExamTable";
import type { ExamStatus } from "@/components/atoms/k/ExamStatusBadge";
import { useQuizSetStore } from "@/stores/useQuizSetStore";

export default function ManageExamPage() {
  const router = useRouter();
  const { quizSetsK, loading, fetchQuizSets, deleteQuizSet } =
    useQuizSetStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const limit = 10;

  // Fetch quiz sets khi component mount hoặc khi filter thay đổi
  useEffect(() => {
    const loadQuizSets = async () => {
      const isPublic =
        statusFilter === "public"
          ? true
          : statusFilter === "private"
          ? false
          : undefined;

      const response = await fetchQuizSets({
        page: currentPage,
        limit,
        search: searchQuery || undefined,
        isPublic,
      });

      if (response) {
        setTotalResults(response.total);
      }
    };

    loadQuizSets();
  }, [currentPage, searchQuery, statusFilter, fetchQuizSets]);

  // Transform quiz sets data to table data format
  const transformedExams: ExamTableData[] = quizSetsK.map((quizSet) => ({
    id: quizSet.id,
    icon: "📘", // Default icon, có thể custom theo tags
    name: quizSet.title,
    description: quizSet.description || "",
    questionCount: 0, // Backend chưa trả về thông tin số câu hỏi, cần update sau
    status: (quizSet.isPublic ? "public" : "private") as ExamStatus,
    createdDate: new Date(quizSet.createdAt).toLocaleDateString("vi-VN"),
    lastStudied: null, // Backend chưa có thông tin này
    tags: quizSet.tags || [],
  }));

  const totalPages = Math.ceil(totalResults / limit);

  // Tính stats từ dữ liệu thực
  const stats = {
    totalExams: totalResults,
    totalExamsTrend: 0, // Cần API riêng để lấy trend
    activeExams: quizSetsK.filter((qs) => qs.isPublic).length,
    activeExamsTrend: 0,
    totalQuestions: 0, // Cần tính từ tất cả quizSet
    totalQuestionsTrend: 0,
    completionRate: 0, // Cần API riêng để lấy completion rate
    completionRateTrend: 0,
  };

  const statusOptions = [
    { value: "all", label: "Tất cả trạng thái" },
    { value: "public", label: "Public" },
    { value: "private", label: "Private" },
  ];

  const categoryOptions = [
    { value: "all", label: "Tất cả danh mục" },
    { value: "math", label: "Toán học" },
    { value: "physics", label: "Vật lý" },
    { value: "chemistry", label: "Hóa học" },
    { value: "english", label: "Tiếng Anh" },
    { value: "history", label: "Lịch sử" },
  ];

  const handleCreateExam = () => {
    router.push("/k/ai-tool");
  };

  const handleExport = () => {
    console.log("Export quiz sets");
  };

  const handleViewExam = (id: string) => {
    router.push(`/k/quiz/${id}`);
  };

  const handleEditExam = (id: string) => {
    router.push(`/k/quiz/edit/${id}`);
  };

  const handleDeleteExam = async (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa bộ đề thi này?")) {
      try {
        await deleteQuizSet(id);
      } catch (error) {
        console.error("Delete quiz set error:", error);
      }
    }
  };

  if (loading && quizSetsK.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <ExamManagementTemplate
      stats={stats}
      exams={transformedExams}
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
