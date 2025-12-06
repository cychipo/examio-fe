import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ExamHistoryListItem,
  type ExamHistoryListItemData,
} from "@/components/molecules/ExamHistoryListItem";
import Link from "next/link";

interface ExamHistoryListSectionProps {
  items: ExamHistoryListItemData[];
  onClick?: (id: string) => void;
  maxItems?: number;
}

export function ExamHistoryListSection({
  items,
  onClick,
  maxItems = 4,
}: ExamHistoryListSectionProps) {
  const displayItems = items.slice(0, maxItems);

  return (
    <Card className="glass-card h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg font-semibold text-foreground">
              Lịch sử làm bài
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-0.5">
              Kết quả các bài thi đã làm
            </p>
          </div>
          <Link
            href="/k/history/exam"
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
              <ExamHistoryListItem
                key={item.id}
                item={item}
                onClick={onClick}
              />
            ))
          ) : (
            <div className="py-8 text-center">
              <p className="text-muted-foreground text-sm">
                Chưa có lịch sử bài thi
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
