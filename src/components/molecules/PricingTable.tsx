"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckIcon } from "@radix-ui/react-icons";
import NumberFlow from "@number-flow/react";

export type PlanLevel = "starter" | "pro" | "all" | string;

export interface PricingFeature {
  name: string;
  included: PlanLevel | null;
}

export interface PricingPlan {
  name: string;
  level: PlanLevel;
  price: {
    monthly: number;
    yearly: number;
  };
  popular?: boolean;
}

export interface PricingTableProps extends React.HTMLAttributes<HTMLDivElement> {
  features: PricingFeature[];
  plans: PricingPlan[];
  onPlanSelect?: (plan: PlanLevel) => void;
  defaultPlan?: PlanLevel;
  defaultInterval?: "monthly" | "yearly";
  containerClassName?: string;
  buttonClassName?: string;
}

export function PricingTable({
  features,
  plans,
  onPlanSelect,
  defaultPlan = "pro",
  defaultInterval = "monthly",
  className,
  containerClassName,
  buttonClassName,
  ...props
}: PricingTableProps) {
  const [isYearly, setIsYearly] = React.useState(defaultInterval === "yearly");
  const [selectedPlan, setSelectedPlan] =
    React.useState<PlanLevel>(defaultPlan);

  const handlePlanSelect = (plan: PlanLevel) => {
    setSelectedPlan(plan);
    onPlanSelect?.(plan);
  };

  return (
    <section
      className={cn(
        "bg-background text-foreground",
        "px-4",
        "fade-bottom overflow-hidden -mt-12",
      )}
    >
      <div
        className={cn("w-full max-w-6xl mx-auto px-4", containerClassName)}
        {...props}
      >
        <div className="flex flex-col sm:flex-row justify-between mb-4 sm:mb-8 gap-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl">Bảng giá</h2>
          <div className="inline-flex items-center gap-2 text-xs sm:text-sm self-start sm:self-center">
            <button
              type="button"
              onClick={() => setIsYearly(false)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                !isYearly ? "bg-zinc-100" : "text-zinc-500",
              )}
            >
              Theo tháng
            </button>
            <button
              type="button"
              onClick={() => setIsYearly(true)}
              className={cn(
                "px-3 py-1 rounded-md transition-colors",
                isYearly ? "bg-zinc-100" : "text-zinc-500",
              )}
            >
              Theo năm
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          {plans.map((plan) => (
            <button
              key={plan.name}
              type="button"
              onClick={() => handlePlanSelect(plan.level)}
              className={cn(
                "flex-1 min-w-[140px] sm:min-w-0 p-3 sm:p-4 rounded-xl text-left transition-all",
                "border border-border",
                selectedPlan === plan.level &&
                  "ring-2 ring-primary",
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{plan.name}</span>
                {plan.popular && (
                  <span className="text-xs bg-red-100 text-primary px-2 py-0.5 rounded-full">
                    Phổ biến
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1">
                <NumberFlow
                  format={{
                    style: "currency",
                    currency: "VND",
                    trailingZeroDisplay: "stripIfInteger",
                  }}
                  value={isYearly ? plan.price.yearly : plan.price.monthly}
                  className="text-2xl font-bold"
                />
                <span className="text-sm font-normal text-zinc-500">
                  /{isYearly ? "năm" : "tháng"}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[500px] sm:min-w-[640px] divide-y divide-zinc-200">
              <div className="flex items-center p-4 bg-zinc-50">
                <div className="flex-1 text-sm font-medium">Tính năng</div>
                <div className="flex items-center gap-8 text-sm">
                  {plans.map((plan) => (
                    <div
                      key={plan.level}
                      className="w-16 text-center font-medium"
                    >
                      {plan.name}
                    </div>
                  ))}
                </div>
              </div>
              {features.map((feature) => (
                <div
                  key={feature.name}
                  className={cn(
                    "flex items-center p-4 transition-colors",
                    feature.included === selectedPlan &&
                      "bg-red-50/50",
                  )}
                >
                  <div className="flex-1 text-sm">{feature.name}</div>
                  <div className="flex items-center gap-8 text-sm">
                    {plans.map((plan) => (
                      <div
                        key={plan.level}
                        className={cn(
                          "w-16 flex justify-center",
                          plan.level === selectedPlan && "font-medium",
                        )}
                      >
                        {shouldShowCheck(feature.included, plan.level) ? (
                          <CheckIcon className="w-5 h-5 text-primary" />
                        ) : (
                          <span className="text-zinc-300">
                            -
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function shouldShowCheck(
  included: PricingFeature["included"],
  level: string,
): boolean {
  if (included === "all") return true;
  if (included === "pro" && (level === "pro" || level === "all")) return true;
  if (
    included === "starter" &&
    (level === "starter" || level === "pro" || level === "all")
  )
    return true;
  return false;
}
