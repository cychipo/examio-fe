import { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  PDFHistoryListItem,
  type PDFHistoryListItemData,
} from "@/components/molecules/PDFHistoryListItem";
import { getPDFHistoryApi, type PDFHistoryItem } from "@/apis/historyApi";
import { storeCache, CacheTTL } from "@/lib/storeCache";
import { useToast } from "@/components/ui/toast";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
    if (item.processingStatus === "COMPLETED" || quizCount > 0 || flashcardCount > 0) {
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

export default function PDFHistoryPage() {
  const [items, setItems] = useState<PDFHistoryListItemData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const pdfDataMapRef = useRef<Map<string, PDFHistoryItem>>(new Map());
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await storeCache.fetchWithCache(
        storeCache.createKey("history-pdf-full", { limit: 100 }),
        () => getPDFHistoryApi(100),
        { ttl: CacheTTL.FIVE_MINUTES },
      );
      setItems(transformPDFHistory(data));
      const newMap = new Map<string, PDFHistoryItem>();
      data.forEach((item) => newMap.set(item.id, item));
      pdfDataMapRef.current = newMap;
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
  const paginatedItems = items.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const handleDownload = async (id: string) => {
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
  };

  const handleDelete = (id: string) => {
    console.log("Delete PDF:", id);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 pb-6 pt-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link to="/k/history">Lịch sử</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Lịch sử xử lý PDF</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

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

          {totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2 border-t border-border/50 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-muted-foreground">
                Trang {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
