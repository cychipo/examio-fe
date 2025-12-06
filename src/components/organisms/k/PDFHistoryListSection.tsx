import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PDFHistoryListItem,
  type PDFHistoryListItemData,
} from "@/components/molecules/PDFHistoryListItem";
import Link from "next/link";

interface PDFHistoryListSectionProps {
  items: PDFHistoryListItemData[];
  onDownload?: (id: string) => void;
  onDelete?: (id: string) => void;
  maxItems?: number;
}

export function PDFHistoryListSection({
  items,
  onDownload,
  onDelete,
  maxItems = 4,
}: PDFHistoryListSectionProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Lịch sử xử lý PDF
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Các file PDF tải lên gần đây
            </p>
          </div>
          <Link
            href="/k/history/pdf"
            className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            Xem tất cả
          </Link>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="divide-y divide-border/50">
          {displayItems.length > 0 ? (
            displayItems.map((item) => (
              <PDFHistoryListItem
                key={item.id}
                item={item}
                onDownload={onDownload}
                onDelete={onDelete}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Chưa có lịch sử PDF
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
