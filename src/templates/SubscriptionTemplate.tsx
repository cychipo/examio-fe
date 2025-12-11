"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditSlider } from "@/components/molecules/subscription/CreditSlider";
import { CreditStatisticsCard } from "@/components/molecules/subscription/CreditStatisticsCard";
import { UsageBreakdownCard } from "@/components/molecules/subscription/UsageBreakdownCard";
import { TransactionHistoryTable } from "@/components/molecules/subscription/TransactionHistoryTable";
import {
  SubscriptionPlanCard,
  SubscriptionPlan,
} from "@/components/molecules/subscription/SubscriptionPlanCard";
import { QRPaymentDialog } from "@/components/organisms/subscription/QRPaymentDialog";
import type {
  WalletDetails,
  PaymentWithQR,
  UserSubscription,
} from "@/apis/subscriptionApi";
import {
  createCreditPaymentApi,
  createSubscriptionPaymentApi,
  getPaymentStatusApi,
  getSubscriptionApi,
  getSubscriptionPlansApi,
  cancelPaymentApi,
} from "@/apis/subscriptionApi";
import { toast } from "@/components/ui/toast";
import { Crown } from "lucide-react";

interface SubscriptionTemplateProps {
  walletDetails: WalletDetails;
  onPageChange: (page: number) => void;
}

export function SubscriptionTemplate({
  walletDetails,
  onPageChange,
}: SubscriptionTemplateProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );
  const [isLoading, setIsLoading] = useState(false);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [paymentData, setPaymentData] = useState<PaymentWithQR | null>(null);
  const [currentSubscription, setCurrentSubscription] =
    useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);

  // Load subscription data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [subscription, subscriptionPlans] = await Promise.all([
          getSubscriptionApi(),
          getSubscriptionPlansApi(),
        ]);
        setCurrentSubscription(subscription);
        setPlans(subscriptionPlans);
      } catch {
        // Ignore errors - user might not be logged in
      }
    };
    loadData();
  }, []);

  // Handle credit purchase
  const handleCreditPurchase = async (credits: number) => {
    setIsLoading(true);
    try {
      const payment = await createCreditPaymentApi(credits);
      setPaymentData(payment);
      setShowQRDialog(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle subscription purchase
  const handleSubscriptionSelect = async (plan: SubscriptionPlan) => {
    setIsLoading(true);
    try {
      const payment = await createSubscriptionPaymentApi(
        plan.tier,
        billingCycle
      );
      setPaymentData(payment);
      setShowQRDialog(true);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  // Check payment status
  const handleCheckStatus = async (paymentId: string) => {
    const status = await getPaymentStatusApi(paymentId);
    if (status.status === 1) {
      toast.success("Thanh toán thành công!");
      // Reload page to refresh wallet
      setTimeout(() => window.location.reload(), 2000);
    }
    return status;
  };

  // Cancel payment
  const handleCancelPayment = async (paymentId: string) => {
    await cancelPaymentApi(paymentId);
    setPaymentData(null);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 pt-8 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Credits & Gói đăng ký
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý credits và nâng cấp tài khoản
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

      {/* Subscription Plans Section */}
      <Card className="glass-card">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Gói đăng ký
            </CardTitle>
            <Tabs
              value={billingCycle}
              onValueChange={(v) => setBillingCycle(v as "monthly" | "yearly")}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="monthly">Tháng</TabsTrigger>
                <TabsTrigger value="yearly">Năm (-10%)</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <SubscriptionPlanCard
                key={plan.tier}
                plan={plan}
                billingCycle={billingCycle}
                isCurrentPlan={
                  currentSubscription?.tier === plan.tier &&
                  currentSubscription?.isActive
                }
                onSelect={handleSubscriptionSelect}
                isLoading={isLoading}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Layout */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column - Credit Slider & History */}
        <div className="lg:col-span-2 space-y-6">
          {/* Credit Slider */}
          <CreditSlider
            onPurchase={handleCreditPurchase}
            isLoading={isLoading}
          />

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

      {/* QR Payment Dialog */}
      <QRPaymentDialog
        open={showQRDialog}
        onOpenChange={setShowQRDialog}
        paymentData={paymentData}
        onCheckStatus={handleCheckStatus}
        onCancelPayment={handleCancelPayment}
        pollInterval={3000}
      />
    </div>
  );
}
