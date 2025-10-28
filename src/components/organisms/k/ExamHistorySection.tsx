import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ExamHistoryCard,
  type ExamHistoryItem,
} from "@/components/molecules/ExamHistoryCard";
import { HistoryFilterBar } from "@/components/molecules/HistoryFilterBar";

interface ExamHistorySectionProps {
  items: ExamHistoryItem[];
  searchValue: string;
  onSearchChange: (value: string) => void;
  filterValue: string;
  onFilterChange: (value: string) => void;
}

const filterOptions = [
  { value: "all", label: "Tất cả" },
  { value: "passed", label: "Đạt" },
  { value: "failed", label: "Không đạt" },
  { value: "high-score", label: "Điểm cao (≥8)" },
  { value: "medium-score", label: "Điểm trung bình (5-7.9)" },
  { value: "low-score", label: "Điểm thấp (<5)" },
];

export function ExamHistorySection({
  items,
  searchValue,
  onSearchChange,
  filterValue,
  onFilterChange,
}: ExamHistorySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-foreground">
          Lịch sử làm bài thi
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Danh sách các bài thi đã hoàn thành và kết quả đạt được
        </p>
      </CardHeader>
      <CardContent>
        <HistoryFilterBar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          filterValue={filterValue}
          onFilterChange={onFilterChange}
          filterOptions={filterOptions}
          placeholder="Tìm kiếm theo tên đề thi..."
        />

        <div className="mt-6">
          <ScrollArea className="h-[500px]">
            <div className="space-y-3 pr-3">
              {items.length > 0 ? (
                items.map((item) => (
                  <ExamHistoryCard key={item.id} item={item} />
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
