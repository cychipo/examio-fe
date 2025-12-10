"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TransactionPagination } from "@/apis/subscriptionApi";

interface TransactionHistoryTableProps {
  transactions: TransactionPagination;
  onPageChange: (page: number) => void;
}

const TYPE_BADGE_STYLES: Record<number, string> = {
  0: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400",
  1: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400",
  2: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400",
  3: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400",
  4: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400",
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function TransactionHistoryTable({
  transactions,
  onPageChange,
}: TransactionHistoryTableProps) {
  const { data, page, totalPages, total } = transactions;

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">
            Lịch sử giao dịch
          </CardTitle>
          <span className="text-sm text-muted-foreground">
            {total} giao dịch
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide">
                <th className="pb-3 pr-4">Ngày</th>
                <th className="pb-3 pr-4">Loại</th>
                <th className="pb-3 pr-4">Mô tả</th>
                <th className="pb-3 pr-4 text-right">Credits</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.length > 0 ? (
                data.map((tx) => (
                  <tr key={tx.id} className="text-sm">
                    <td className="py-3 pr-4 text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge
                        variant="secondary"
                        className={`border-0 text-xs ${TYPE_BADGE_STYLES[tx.type] || ""}`}
                      >
                        {tx.typeLabel}
                      </Badge>
                    </td>
                    <td className="py-3 pr-4 text-foreground max-w-[200px] truncate">
                      {tx.description || "-"}
                    </td>
                    <td
                      className={`py-3 text-right font-medium ${
                        tx.direction === "ADD" ? "text-emerald-600" : "text-red-500"
                      }`}
                    >
                      {tx.direction === "ADD" ? "+" : "-"}
                      {tx.amount.toLocaleString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-muted-foreground">
                    Chưa có giao dịch nào
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <span className="text-sm text-muted-foreground">
              Trang {page} / {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page - 1)}
                disabled={page <= 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(page + 1)}
                disabled={page >= totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
