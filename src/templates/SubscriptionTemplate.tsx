"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditPackageCard } from "@/components/atoms/subscription/CreditPackageCard";
import { CreditStatisticsCard } from "@/components/molecules/subscription/CreditStatisticsCard";
import { UsageBreakdownCard } from "@/components/molecules/subscription/UsageBreakdownCard";
import { TransactionHistoryTable } from "@/components/molecules/subscription/TransactionHistoryTable";
import type { WalletDetails } from "@/apis/subscriptionApi";
import { useState } from "react";
import { ShoppingCart } from "lucide-react";

interface SubscriptionTemplateProps {
  walletDetails: WalletDetails;
  onPageChange: (page: number) => void;
}

const CREDIT_PACKAGES = [
  { credits: 500, price: 9.99, pricePerCredit: 0.02 },
  { credits: 1500, price: 24.99, pricePerCredit: 0.017, isPopular: true },
  { credits: 3000, price: 39.99, pricePerCredit: 0.013 },
];

export function SubscriptionTemplate({
  walletDetails,
  onPageChange,
}: SubscriptionTemplateProps) {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(1); // Default to popular

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pt-8 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Credits & Thanh toán
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý credits và xem lịch sử giao dịch
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-xl">
          <span className="text-sm font-medium text-muted-foreground">
            Số dư hiện tại
          </span>
          <span className="text-lg font-bold text-primary">
            {walletDetails.balance.toLocaleString()} Credits
          </span>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Purchase & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Purchase Credits */}
          <Card className="glass-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">
                Mua thêm credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {CREDIT_PACKAGES.map((pkg, index) => (
                  <CreditPackageCard
                    key={pkg.credits}
                    credits={pkg.credits}
                    price={pkg.price}
                    pricePerCredit={pkg.pricePerCredit}
                    isPopular={pkg.isPopular}
                    isSelected={selectedPackage === index}
                    onSelect={() => setSelectedPackage(index)}
                  />
                ))}
              </div>
              <Button className="w-full" size="lg">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Mua gói đã chọn
              </Button>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <TransactionHistoryTable
            transactions={walletDetails.transactions}
            onPageChange={onPageChange}
          />
        </div>

        {/* Right Column - Stats & Breakdown */}
        <div className="space-y-6">
          <CreditStatisticsCard
            balance={walletDetails.balance}
            totalPurchased={walletDetails.totalPurchased}
            totalUsed={walletDetails.totalUsed}
          />
          <UsageBreakdownCard breakdown={walletDetails.usageBreakdown} />
        </div>
      </div>
    </div>
  );
}
