"use client";

import { cn } from "@/lib/utils";
import { Check, Sparkles } from "lucide-react";

interface CreditPackageCardProps {
  credits: number;
  price: number;
  pricePerCredit: number;
  isPopular?: boolean;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function CreditPackageCard({
  credits,
  price,
  pricePerCredit,
  isPopular = false,
  isSelected = false,
  onSelect,
}: CreditPackageCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        "relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 hover:scale-[1.02]",
        isSelected
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border/50 hover:border-primary/50",
        isPopular && "ring-2 ring-primary/20"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full flex items-center gap-1">
          <Sparkles className="h-3 w-3" />
          Popular
        </div>
      )}

      <div className="text-center space-y-2">
        <p className="text-3xl font-bold text-foreground">
          {credits.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">Credits</p>
        <p className="text-xl font-semibold text-primary">
          ${price.toFixed(2)}
        </p>
        <p className="text-xs text-muted-foreground">
          ${pricePerCredit.toFixed(3)} per credit
        </p>
      </div>

      {isSelected && (
        <div className="absolute top-2 right-2">
          <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
            <Check className="h-3 w-3 text-primary-foreground" />
          </div>
        </div>
      )}
    </div>
  );
}
