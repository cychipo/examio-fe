"use client";

import { useState } from "react";
import { HistoryTemplate } from "@/templates/HistoryTemplate";
import type { PDFHistoryItem } from "@/components/molecules/PDFHistoryCard";
import type { ExamHistoryItem } from "@/components/molecules/ExamHistoryCard";

// Mock data for PDF history
const mockPDFItems: PDFHistoryItem[] = [
  {
    id: "1",
    fileName: "Bài giảng Toán cao cấp - Chương 1.pdf",
    generatedType: "exam",
    generatedCount: 25,
    status: "completed",
    createdAt: "2 giờ trước",
    fileSize: "2.4 MB",
  },
  {
    id: "2",
    fileName: "Lịch sử Việt Nam hiện đại.pdf",
    generatedType: "flashcard",
    generatedCount: 50,
    status: "completed",
    createdAt: "5 giờ trước",
    fileSize: "1.8 MB",
  },
  {
    id: "3",
    fileName: "Nguyên lý Marketing - Chapter 3.pdf",
    generatedType: "exam",
    generatedCount: 30,
    status: "processing",
    createdAt: "1 ngày trước",
    fileSize: "3.2 MB",
  },
  {
    id: "4",
    fileName: "Giáo trình Vật lý đại cương.pdf",
    generatedType: "flashcard",
    generatedCount: 45,
    status: "completed",
    createdAt: "2 ngày trước",
    fileSize: "5.6 MB",
  },
  {
    id: "5",
    fileName: "Hóa học hữu cơ - Bài tập.pdf",
    generatedType: "exam",
    generatedCount: 20,
    status: "failed",
    createdAt: "3 ngày trước",
    fileSize: "1.2 MB",
  },
  {
    id: "6",
    fileName: "Tiếng Anh chuyên ngành IT.pdf",
    generatedType: "flashcard",
    generatedCount: 60,
    status: "completed",
    createdAt: "1 tuần trước",
    fileSize: "2.9 MB",
  },
  {
    id: "7",
    fileName: "Cơ sở dữ liệu - Chương 4, 5.pdf",
    generatedType: "exam",
    generatedCount: 35,
    status: "completed",
    createdAt: "1 tuần trước",
    fileSize: "4.1 MB",
  },
  {
    id: "8",
    fileName: "Triết học Mác - Lênin.pdf",
    generatedType: "flashcard",
    generatedCount: 40,
    status: "completed",
    createdAt: "2 tuần trước",
    fileSize: "2.2 MB",
  },
];

// Mock data for exam history
const mockExamItems: ExamHistoryItem[] = [
  {
    id: "1",
    examTitle: "Kiểm tra Toán cao cấp - Giải tích",
    subject: "Toán học",
    score: 8.5,
    totalQuestions: 20,
    correctAnswers: 17,
    timeSpent: "45 phút",
    completedAt: "Hôm nay, 14:30",
    passed: true,
  },
  {
    id: "2",
    examTitle: "Thi cuối kỳ Lịch sử Việt Nam",
    subject: "Lịch sử",
    score: 9.0,
    totalQuestions: 25,
    correctAnswers: 23,
    timeSpent: "50 phút",
    completedAt: "Hôm qua, 10:15",
    passed: true,
  },
  {
    id: "3",
    examTitle: "Kiểm tra Marketing căn bản",
    subject: "Marketing",
    score: 6.5,
    totalQuestions: 30,
    correctAnswers: 20,
    timeSpent: "60 phút",
    completedAt: "2 ngày trước",
    passed: true,
  },
  {
    id: "4",
    examTitle: "Thi giữa kỳ Vật lý đại cương",
    subject: "Vật lý",
    score: 4.5,
    totalQuestions: 20,
    correctAnswers: 9,
    timeSpent: "40 phút",
    completedAt: "3 ngày trước",
    passed: false,
  },
  {
    id: "5",
    examTitle: "Bài tập Hóa học hữu cơ",
    subject: "Hóa học",
    score: 7.0,
    totalQuestions: 15,
    correctAnswers: 11,
    timeSpent: "30 phút",
    completedAt: "1 tuần trước",
    passed: true,
  },
  {
    id: "6",
    examTitle: "Thi thử TOEIC - Reading & Listening",
    subject: "Tiếng Anh",
    score: 8.0,
    totalQuestions: 50,
    correctAnswers: 40,
    timeSpent: "90 phút",
    completedAt: "1 tuần trước",
    passed: true,
  },
  {
    id: "7",
    examTitle: "Kiểm tra Cơ sở dữ liệu",
    subject: "Tin học",
    score: 9.5,
    totalQuestions: 25,
    correctAnswers: 24,
    timeSpent: "55 phút",
    completedAt: "2 tuần trước",
    passed: true,
  },
  {
    id: "8",
    examTitle: "Thi cuối kỳ Triết học Mác - Lênin",
    subject: "Chính trị",
    score: 7.5,
    totalQuestions: 30,
    correctAnswers: 23,
    timeSpent: "60 phút",
    completedAt: "2 tuần trước",
    passed: true,
  },
  {
    id: "9",
    examTitle: "Kiểm tra Lập trình Web",
    subject: "Tin học",
    score: 8.5,
    totalQuestions: 20,
    correctAnswers: 17,
    timeSpent: "45 phút",
    completedAt: "3 tuần trước",
    passed: true,
  },
  {
    id: "10",
    examTitle: "Thi giữa kỳ Kinh tế vi mô",
    subject: "Kinh tế",
    score: 5.5,
    totalQuestions: 25,
    correctAnswers: 14,
    timeSpent: "50 phút",
    completedAt: "1 tháng trước",
    passed: true,
  },
];

export default function HistoryPage() {
  const [pdfSearchValue, setPdfSearchValue] = useState("");
  const [pdfFilterValue, setPdfFilterValue] = useState("all");
  const [examSearchValue, setExamSearchValue] = useState("");
  const [examFilterValue, setExamFilterValue] = useState("all");

  // Calculate stats
  const stats = {
    totalPDFs: mockPDFItems.length,
    totalExams: mockExamItems.length,
    averageScore:
      mockExamItems.reduce((sum, item) => sum + item.score, 0) /
      mockExamItems.length,
    passRate: Math.round(
      (mockExamItems.filter((item) => item.passed).length /
        mockExamItems.length) *
        100
    ),
  };

  // Filter PDF items
  const filteredPDFItems = mockPDFItems.filter((item) => {
    const matchesSearch = item.fileName
      .toLowerCase()
      .includes(pdfSearchValue.toLowerCase());

    if (pdfFilterValue === "all") return matchesSearch;
    if (pdfFilterValue === "exam")
      return matchesSearch && item.generatedType === "exam";
    if (pdfFilterValue === "flashcard")
      return matchesSearch && item.generatedType === "flashcard";
    if (pdfFilterValue === "completed")
      return matchesSearch && item.status === "completed";
    if (pdfFilterValue === "processing")
      return matchesSearch && item.status === "processing";
    if (pdfFilterValue === "failed")
      return matchesSearch && item.status === "failed";

    return matchesSearch;
  });

  // Filter exam items
  const filteredExamItems = mockExamItems.filter((item) => {
    const matchesSearch =
      item.examTitle.toLowerCase().includes(examSearchValue.toLowerCase()) ||
      item.subject.toLowerCase().includes(examSearchValue.toLowerCase());

    if (examFilterValue === "all") return matchesSearch;
    if (examFilterValue === "passed") return matchesSearch && item.passed;
    if (examFilterValue === "failed") return matchesSearch && !item.passed;
    if (examFilterValue === "high-score")
      return matchesSearch && item.score >= 8;
    if (examFilterValue === "medium-score")
      return matchesSearch && item.score >= 5 && item.score < 8;
    if (examFilterValue === "low-score") return matchesSearch && item.score < 5;

    return matchesSearch;
  });

  const handlePdfDownload = (id: string) => {
    console.log("Download PDF:", id);
    // Implement download logic
  };

  const handlePdfDelete = (id: string) => {
    console.log("Delete PDF:", id);
    // Implement delete logic
  };

  return (
    <HistoryTemplate
      stats={stats}
      pdfItems={filteredPDFItems}
      examItems={filteredExamItems}
      pdfSearchValue={pdfSearchValue}
      onPdfSearchChange={setPdfSearchValue}
      pdfFilterValue={pdfFilterValue}
      onPdfFilterChange={setPdfFilterValue}
      examSearchValue={examSearchValue}
      onExamSearchChange={setExamSearchValue}
      examFilterValue={examFilterValue}
      onExamFilterChange={setExamFilterValue}
      onPdfDownload={handlePdfDownload}
      onPdfDelete={handlePdfDelete}
    />
  );
}
