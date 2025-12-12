"use client";

import { useEffect, useState } from "react";
import {
  PricingTable,
  PricingFeature,
  PricingPlan,
} from "../molecules/PricingTable";
import { api } from "@/apis/api";
import { Loader2 } from "lucide-react";

interface SubscriptionPlanResponse {
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

// Map tier numbers to plan levels
const tierToLevel: Record<number, string> = {
  1: "starter",
  2: "pro",
  3: "all",
};

// Generate features from plan data
function generateFeatures(plans: SubscriptionPlanResponse[]): PricingFeature[] {
  const features: PricingFeature[] = [];

  // Sort plans by tier
  const sortedPlans = [...plans].sort((a, b) => a.tier - b.tier);

  sortedPlans.forEach((plan) => {
    const level = tierToLevel[plan.tier];

    // Credits
    if (plan.creditsPerMonth > 0) {
      features.push({
        name: `${plan.creditsPerMonth} credits/tháng`,
        included: level,
      });
    }

    // Files per month
    if (plan.filesPerMonth === -1) {
      features.push({
        name: "Upload file không giới hạn",
        included: level,
      });
    } else {
      features.push({
        name: `Tối đa ${plan.filesPerMonth} file/tháng`,
        included: level,
      });
    }

    // Messages per minute
    if (plan.messagesPerMinute === -1) {
      features.push({
        name: "Không giới hạn tin nhắn",
        included: level,
      });
    } else {
      features.push({
        name: `${plan.messagesPerMinute} tin nhắn/phút`,
        included: level,
      });
    }

    // Chat messages limit
    features.push({
      name: `${plan.chatMessagesLimit} tin nhắn chat/ngày`,
      included: level,
    });
  });

  return features;
}

// Transform API response to PricingPlan format
function transformPlans(apiPlans: SubscriptionPlanResponse[]): PricingPlan[] {
  return apiPlans.map((plan) => ({
    name: plan.nameVi,
    price: {
      monthly: plan.priceMonthly,
      yearly: plan.priceYearly,
    },
    level: tierToLevel[plan.tier],
    popular: plan.tier === 2, // Advanced tier is popular
  }));
}

export default function PricingSection() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [features, setFeatures] = useState<PricingFeature[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const response = await api.get<SubscriptionPlanResponse[]>(
          "/payment/subscription/plans"
        );
        const apiPlans = response.data;

        setPlans(transformPlans(apiPlans));
        setFeatures(generateFeatures(apiPlans));
        setError(null);
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
        setError("Không thể tải thông tin gói đăng ký. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (plans.length === 0) {
    return null;
  }

  return (
    <PricingTable
      features={features}
      plans={plans}
      defaultPlan="pro"
      defaultInterval="monthly"
      onPlanSelect={(plan) =>
        console.warn("Unimplemented!", "Current plan:", plan)
      }
      containerClassName="py-12"
      buttonClassName="bg-primary hover:bg-primary/90"
    />
  );
}
