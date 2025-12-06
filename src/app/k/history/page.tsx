"use client";

import { useState, useEffect, useCallback } from "react";
import { HistoryTemplate } from "@/templates/HistoryTemplate";
import type { PDFHistoryListItemData } from "@/components/molecules/PDFHistoryListItem";
import type { ExamHistoryListItemData } from "@/components/molecules/ExamHistoryListItem";
import type { RecentActivityItemData, ActivityType } from "@/components/molecules/RecentActivityItem";
import {
  getHistoryStatsApi,
  getPDFHistoryApi,
  getExamHistoryApi,
  type HistoryStats,
  type PDFHistoryItem,
  type ExamHistoryItem,
} from "@/apis/historyApi";

// Transform PDF history from API to component format
function transformPDFHistory(items: PDFHistoryItem[]): PDFHistoryListItemData[] {
  return items.map((item) => {
    const quizCount = item.quizHistory?.quizzes?.length || 0;
    const flashcardCount = item.flashcardHistory?.flashcards?.length || 0;

    let description = "";
    if (quizCount > 0 && flashcardCount > 0) {
      description = `Tạo ${flashcardCount} flashcard, ${quizCount} câu hỏi`;
    } else if (quizCount > 0) {
      description = `Tạo ${quizCount} câu hỏi`;
    } else if (flashcardCount > 0) {
      description = `Tạo ${flashcardCount} flashcard`;
    } else {
      description = "Đang xử lý...";
    }

    return {
      id: item.id,
      fileName: item.filename,
      description,
      status: (quizCount > 0 || flashcardCount > 0) ? "completed" as const : "processing" as const,
      createdAt: formatTimeAgo(item.createdAt),
    };
  });
}

// Transform exam history from API to component format
function transformExamHistory(items: ExamHistoryItem[]): ExamHistoryListItemData[] {
  return items.map((item) => ({
    id: item.id,
    examTitle: item.examSession.examRoom.title,
    score: item.score,
    totalQuestions: item.totalQuestions,
    correctAnswers: item.correctAnswers,
    completedAt: `Hoàn thành ${formatTimeAgo(item.finishedAt || item.startedAt)}`,
    passed: item.score >= 50, // 50% passing score
  }));
}

// Generate recent activities from both PDF and exam history
function generateRecentActivities(
  pdfItems: PDFHistoryItem[],
  examItems: ExamHistoryItem[]
): RecentActivityItemData[] {
  const activities: RecentActivityItemData[] = [];

  // Add exam activities
  examItems.slice(0, 2).forEach((item) => {
    const percentage = Math.round((item.correctAnswers / item.totalQuestions) * 100);
    activities.push({
      id: `exam-${item.id}`,
      type: "exam_score" as ActivityType,
      title: percentage >= 80 ? "Xuất sắc!" : percentage >= 60 ? "Làm tốt lắm!" : "Hoàn thành bài thi",
      description: `Bạn đạt ${percentage}% trong bài ${item.examSession.examRoom.title}.`,
      timestamp: formatTimeAgo(item.finishedAt || item.startedAt),
    });
  });

  // Add PDF activities
  pdfItems.slice(0, 2).forEach((item) => {
    const hasContent = item.quizHistory || item.flashcardHistory;
    if (hasContent) {
      activities.push({
        id: `pdf-${item.id}`,
        type: "pdf_processed" as ActivityType,
        title: "PDF đã xử lý thành công!",
        description: `${item.filename} đã được chuyển đổi thành tài liệu học tập.`,
        timestamp: formatTimeAgo(item.createdAt),
      });
    }
  });

  // Sort by timestamp (most recent first)
  return activities.slice(0, 5);
}

// Format date to "X giờ trước", "X ngày trước", etc.
function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Vừa xong";
  if (diffMins < 60) return `${diffMins} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays < 7) return `${diffDays} ngày trước`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} tuần trước`;
  return `${Math.floor(diffDays / 30)} tháng trước`;
}

export default function HistoryPage() {
  const [stats, setStats] = useState<HistoryStats>({
    totalPDFs: 0,
    examsCreated: 0,
    flashcardSets: 0,
    totalStudyHours: 0,
  });
  const [pdfItems, setPdfItems] = useState<PDFHistoryListItemData[]>([]);
  const [examItems, setExamItems] = useState<ExamHistoryListItemData[]>([]);
  const [activities, setActivities] = useState<RecentActivityItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      // Fetch all data in parallel
      const [statsData, pdfData, examData] = await Promise.all([
        getHistoryStatsApi(),
        getPDFHistoryApi(10),
        getExamHistoryApi(1, 10),
      ]);

      setStats(statsData);
      setPdfItems(transformPDFHistory(pdfData));

      const transformedExams = transformExamHistory(examData.examAttempts);
      setExamItems(transformedExams);

      setActivities(generateRecentActivities(pdfData, examData.examAttempts));
    } catch (error) {
      console.error("Failed to fetch history data:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePdfDownload = (id: string) => {
    console.log("Download PDF:", id);
    // Implement download logic
  };

  const handlePdfDelete = (id: string) => {
    console.log("Delete PDF:", id);
    // Implement delete logic
  };

  const handleExamClick = (id: string) => {
    console.log("View exam:", id);
    // Navigate to exam detail
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <HistoryTemplate
      stats={stats}
      pdfItems={pdfItems}
      examItems={examItems}
      activities={activities}
      onPdfDownload={handlePdfDownload}
      onPdfDelete={handlePdfDelete}
      onExamClick={handleExamClick}
    />
  );
}
