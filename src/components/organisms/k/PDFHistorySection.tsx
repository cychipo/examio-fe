import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  PDFHistoryCard,
  type PDFHistoryItem,
} from "@/components/molecules/PDFHistoryCard";
import { HistoryFilterBar } from "@/components/molecules/HistoryFilterBar";

interface PDFHistorySectionProps {
  items: PDFHistoryItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
}

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "exam", label: "Đề thi" },
  { value: "flashcard", label: "Flashcard" },
  { value: "completed", label: "Hoàn thành" },
  { value: "processing", label: "Đang xử lý" },
  { value: "failed", label: "Thất bại" },
];

export function PDFHistorySection({
  items,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
  onDownload,
  onDelete,
}: PDFHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Lịch sử tạo từ PDF
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Danh sách các file PDF đã tải lên để tạo đề thi và flashcard
        </p>
      </CardHeader>
      <CardContent>
        <HistoryFilterBar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
          placeholder="Tìm kiếm theo tên file..."
        />

        <div className="mt-6">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-3">
              {items.length > 0 ? (
                items.map((item) => (
                  <PDFHistoryCard
                    key={item.id}
                    item={item}
                    onDownload={onDownload}
                    onDelete={onDelete}
                  />
                ))
              ) : (
                <div className="py-12 text-center">
                  <p className="text-muted-foreground">
                    Không tìm thấy lịch sử nào
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
}
