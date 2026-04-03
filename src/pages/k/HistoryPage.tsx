import { useState, useEffect, useCallback, useRef } from "react";
import { HistoryTemplate } from "@/templates/HistoryTemplate";
import type { PDFHistoryListItemData } from "@/components/molecules/PDFHistoryListItem";
import type { ExamHistoryListItemData } from "@/components/molecules/ExamHistoryListItem";
import type {
  RecentActivityItemData,
  ActivityType,
} from "@/components/molecules/RecentActivityItem";
import {
  getHistoryStatsApi,
  getPDFHistoryApi,
  getExamHistoryApi,
  type HistoryStats,
  type PDFHistoryItem,
  type ExamHistoryItem,
} from "@/apis/historyApi";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { useToast } from "@/components/ui/toast";
import { useAuthStore } from "@/stores/useAuthStore";

function transformPDFHistory(items: PDFHistoryItem[]): PDFHistoryListItemData[] {
  return items.map((item) => {
    const quizCount = item.quizHistory?.quizCount ?? 0;
    const flashcardCount = item.flashcardHistory?.flashcardCount ?? 0;

    let description = "";
    if (quizCount > 0 && flashcardCount > 0) {
      description = `Tạo ${flashcardCount} flashcard, ${quizCount} câu hỏi`;
    } else if (quizCount > 0) {
      description = `Tạo ${quizCount} câu hỏi`;
    } else if (flashcardCount > 0) {
      description = `Tạo ${flashcardCount} flashcard`;
    } else if (item.processingStatus === "COMPLETED") {
      description = "Đã xử lý - sẵn sàng tạo nội dung";
    } else if (item.processingStatus === "FAILED") {
      description = "Xử lý thất bại";
    } else {
      description = "Đang xử lý...";
    }

    let status: "completed" | "processing" | "failed";
    if (
      item.processingStatus === "COMPLETED" ||
      quizCount > 0 ||
      flashcardCount > 0
    ) {
      status = "completed";
    } else if (item.processingStatus === "FAILED") {
      status = "failed";
    } else {
      status = "processing";
    }

    return {
      id: item.id,
      fileName: item.filename,
      description,
      status,
      createdAt: formatTimeAgo(item.createdAt),
    };
  });
}

function transformExamHistory(items: ExamHistoryItem[]): ExamHistoryListItemData[] {
  return items.map((item) => ({
    id: item.id,
    examTitle: item.examSession.examRoom.title,
    score: item.score,
    totalQuestions: item.totalQuestions,
    correctAnswers: item.correctAnswers,
    completedAt: `Hoàn thành ${formatTimeAgo(item.finishedAt || item.startedAt)}`,
    passed: item.score >= 50,
  }));
}

function generateRecentActivities(
  pdfItems: PDFHistoryItem[],
  examItems: ExamHistoryItem[],
): RecentActivityItemData[] {
  const activities: RecentActivityItemData[] = [];

  examItems.slice(0, 2).forEach((item) => {
    const percentage = Math.round((item.correctAnswers / item.totalQuestions) * 100);
    activities.push({
      id: `exam-${item.id}`,
      type: "exam_score" as ActivityType,
      title:
        percentage >= 80
          ? "Xuất sắc!"
          : percentage >= 60
            ? "Làm tốt lắm!"
            : "Hoàn thành bài thi",
      description: `Bạn đạt ${percentage}% trong bài ${item.examSession.examRoom.title}.`,
      timestamp: formatTimeAgo(item.finishedAt || item.startedAt),
    });
  });

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

  return activities.slice(0, 5);
}

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

async function downloadFile(url: string, filename: string): Promise<void> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Download failed");

  const blob = await response.blob();
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(downloadUrl);
}

export default function HistoryPage() {
  const { user } = useAuthStore();
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

  const pdfDataMapRef = useRef<Map<string, PDFHistoryItem>>(new Map());
  const { toast } = useToast();

  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);

      const statsPromise = storeCache.fetchWithCache(
        storeCache.createKey("history-stats", {}),
        () => getHistoryStatsApi(),
        { ttl: CacheTTL.FIVE_MINUTES },
      );

      const pdfPromise = isTeacher
        ? storeCache.fetchWithCache(
            storeCache.createKey("history-pdf", { limit: 10 }),
            () => getPDFHistoryApi(10),
            { ttl: CacheTTL.FIVE_MINUTES },
          )
        : Promise.resolve([]);

      const examPromise = isStudent
        ? storeCache.fetchWithCache(
            storeCache.createKey("history-exam", { page: 1, limit: 10 }),
            () => getExamHistoryApi(1, 10),
            { ttl: CacheTTL.FIVE_MINUTES },
          )
        : Promise.resolve({ examAttempts: [], total: 0 });

      const [statsData, pdfData, examData] = await Promise.all([
        statsPromise,
        pdfPromise,
        examPromise,
      ]);

      setStats(statsData);

      if (isTeacher && Array.isArray(pdfData)) {
        setPdfItems(transformPDFHistory(pdfData));

        const newMap = new Map<string, PDFHistoryItem>();
        pdfData.forEach((item) => newMap.set(item.id, item));
        pdfDataMapRef.current = newMap;
      }

      if (isStudent && examData.examAttempts) {
        setExamItems(transformExamHistory(examData.examAttempts));
      }

      const pdfArray = Array.isArray(pdfData) ? pdfData : [];
      const examArray = examData?.examAttempts || [];
      setActivities(generateRecentActivities(pdfArray, examArray));
    } catch (error) {
      console.error("Failed to fetch history data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isTeacher, isStudent]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePdfDownload = useCallback(
    async (id: string) => {
      const pdfItem = pdfDataMapRef.current.get(id);
      if (!pdfItem) {
        toast.error("Không tìm thấy file PDF");
        return;
      }

      try {
        toast.info("Đang tải file...");
        await downloadFile(pdfItem.url, pdfItem.filename);
        toast.success("Tải file thành công!");
      } catch (error) {
        console.error("Failed to download file:", error);
        toast.error("Không thể tải file. Vui lòng thử lại.");
      }
    },
    [toast],
  );

  const handlePdfDelete = (id: string) => {
    console.log("Delete PDF:", id);
  };

  const handleExamClick = (id: string) => {
    console.log("View exam:", id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
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
      showPdfHistory={isTeacher}
      showExamHistory={isStudent}
      showStats={isTeacher}
    />
  );
}
