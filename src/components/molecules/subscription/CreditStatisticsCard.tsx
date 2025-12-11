"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingUp, TrendingDown } from "lucide-react";

interface CreditStatisticsCardProps {
  balance: number;
  totalPurchased: number;
  totalUsed: number;
}

export function CreditStatisticsCard({
  balance,
  totalPurchased,
  totalUsed,
}: CreditStatisticsCardProps) {
  const stats = [
    {
      label: "Số dư hiện tại",
      value: balance.toLocaleString(),
      icon: Wallet,
      className: "bg-primary/10 text-primary dark:bg-primary/20",
    },
    {
      label: "Tổng đã mua",
      value: totalPurchased.toLocaleString(),
      icon: TrendingUp,
      className: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
    },
    {
      label: "Tổng đã dùng",
      value: totalUsed.toLocaleString(),
      icon: TrendingDown,
      className: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    },
  ];

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Thống kê credits</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.className}`}>
                <stat.icon className="h-4 w-4" />
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <span className="text-lg font-bold text-foreground">{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
