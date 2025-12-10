"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import {
  PDFHistoryListItem,
  type PDFHistoryListItemData,
} from "@/components/molecules/PDFHistoryListItem";
import { getPDFHistoryApi, type PDFHistoryItem } from "@/apis/historyApi";
import { storeCache, CacheTTL } from "@/lib/storeCache";

// Transform PDF history from API to component format
function transformPDFHistory(
  items: PDFHistoryItem[]
): PDFHistoryListItemData[] {
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
      status:
        quizCount > 0 || flashcardCount > 0
          ? ("completed" as const)
          : ("processing" as const),
      createdAt: formatTimeAgo(item.createdAt),
    };
  });
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

export default function PDFHistoryPage() {
  const [items, setItems] = useState<PDFHistoryListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storeCache.fetchWithCache(
        storeCache.createKey("history-pdf-full", { limit: 100 }),
        () => getPDFHistoryApi(100),
        { ttl: CacheTTL.FIVE_MINUTES }
      );
      setItems(transformPDFHistory(data));
    } catch (error) {
      console.error("Failed to fetch PDF history:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDownload = (id: string) => {
    console.log("Download PDF:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete PDF:", id);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 pt-8 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/k/history">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Lịch sử xử lý PDF
          </h1>
          <p className="text-muted-foreground mt-1">
            Tất cả các file PDF đã tải lên và xử lý
          </p>
        </div>
      </div>

      {/* Content */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-foreground">
            Danh sách PDF ({items.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="divide-y divide-border/50">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item) => (
                <PDFHistoryListItem
                  key={item.id}
                  item={item}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))
            ) : (
              <div className="py-12 text-center">
                <p className="text-muted-foreground">Chưa có lịch sử PDF</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-border/50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
