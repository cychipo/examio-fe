"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { UsageBreakdown } from "@/apis/subscriptionApi";

interface UsageBreakdownCardProps {
  breakdown: UsageBreakdown;
}

const USAGE_COLORS = {
  examGeneration: "bg-blue-500",
  flashcardCreation: "bg-emerald-500",
  pdfProcessing: "bg-purple-500",
};

const USAGE_LABELS = {
  examGeneration: "Tạo đề thi",
  flashcardCreation: "Tạo flashcard",
  pdfProcessing: "Xử lý PDF",
};

export function UsageBreakdownCard({ breakdown }: UsageBreakdownCardProps) {
  const items = [
    { key: "examGeneration" as const, value: breakdown.examGeneration },
    { key: "flashcardCreation" as const, value: breakdown.flashcardCreation },
    { key: "pdfProcessing" as const, value: breakdown.pdfProcessing },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Phân loại sử dụng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${USAGE_COLORS[item.key]}`} />
              <span className="text-sm text-muted-foreground">
                {USAGE_LABELS[item.key]}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {item.value.toLocaleString()} credits
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
