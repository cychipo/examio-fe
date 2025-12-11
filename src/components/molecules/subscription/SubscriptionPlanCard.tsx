"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Zap, Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SubscriptionPlan {
  tier: number;
  name: string;
  nameVi: string;
  creditsPerMonth: number;
  filesPerMonth: number;
  messagesPerMinute: number;
  chatMessagesLimit: number;
  priceMonthly: number;
  priceYearly: number;
}

interface SubscriptionPlanCardProps {
  plan: SubscriptionPlan;
  isCurrentPlan?: boolean;
  billingCycle: "monthly" | "yearly";
  onSelect: (plan: SubscriptionPlan) => void;
  isLoading?: boolean;
}

const tierIcons = {
  1: Sparkles,
  2: Zap,
  3: Crown,
};

const tierColors = {
  1: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
  2: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  3: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
};

export function SubscriptionPlanCard({
  plan,
  isCurrentPlan,
  billingCycle,
  onSelect,
  isLoading,
}: SubscriptionPlanCardProps) {
  const Icon = tierIcons[plan.tier as keyof typeof tierIcons] || Sparkles;
  const colorClass =
    tierColors[plan.tier as keyof typeof tierColors] || tierColors[1];
  const price =
    billingCycle === "yearly" ? plan.priceYearly : plan.priceMonthly;
  const pricePerMonth =
    billingCycle === "yearly"
      ? Math.floor(plan.priceYearly / 12)
      : plan.priceMonthly;

  const features = [
    `+${plan.creditsPerMonth} credits / tháng`,
    plan.filesPerMonth === -1
      ? "Không giới hạn file upload"
      : `${plan.filesPerMonth} file / tháng`,
    plan.messagesPerMinute === -1
      ? "Không giới hạn tin nhắn / phút"
      : `${plan.messagesPerMinute} tin nhắn / phút`,
    `${plan.chatMessagesLimit} tin nhắn / đoạn chat`,
  ];

  return (
    <Card
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
        `bg-gradient-to-br ${colorClass}`,
        isCurrentPlan && "ring-2 ring-primary"
      )}>
      {plan.tier === 3 && (
        <Badge className="absolute top-3 right-3 bg-amber-500 text-white">
          Phổ biến
        </Badge>
      )}

      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-primary/20">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <CardTitle className="text-lg">{plan.nameVi}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Price */}
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold">
              {pricePerMonth.toLocaleString("vi-VN")}
            </span>
            <span className="text-muted-foreground">₫/tháng</span>
          </div>
          {billingCycle === "yearly" && (
            <p className="text-sm text-muted-foreground">
              {price.toLocaleString("vi-VN")}₫/năm (tiết kiệm 10%)
            </p>
          )}
        </div>

        {/* Features */}
        <ul className="space-y-2">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        {/* Button */}
        <Button
          className="w-full"
          variant={isCurrentPlan ? "outline" : "default"}
          onClick={() => onSelect(plan)}
          disabled={isCurrentPlan || isLoading}>
          {isCurrentPlan ? "Gói hiện tại" : "Đăng ký ngay"}
        </Button>
      </CardContent>
    </Card>
  );
}
