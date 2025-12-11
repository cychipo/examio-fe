"use client";

import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, ShoppingCart } from "lucide-react";

interface CreditSliderProps {
  minCredits?: number;
  maxCredits?: number;
  step?: number;
  pricePerCredit?: number; // VND per credit
  onPurchase: (credits: number, price: number) => void;
  isLoading?: boolean;
}

export function CreditSlider({
  minCredits = 10,
  maxCredits = 5000,
  step = 10,
  pricePerCredit = 1000,
  onPurchase,
  isLoading = false,
}: CreditSliderProps) {
  const [credits, setCredits] = useState(100);
  const price = credits * pricePerCredit;

  // Format price as Vietnamese currency
  const formatPrice = (amount: number) => {
    return `${amount.toLocaleString("vi-VN")} ₫`;
  };

  return (
    <Card className="glass-card">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" />
          Mua Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Credits display */}
        <div className="text-center space-y-1">
          <p className="text-4xl font-bold text-primary">{credits}</p>
          <p className="text-muted-foreground">Credits</p>
        </div>

        {/* Slider */}
        <div className="px-2">
          <Slider
            value={[credits]}
            onValueChange={(value) => setCredits(value[0])}
            min={minCredits}
            max={maxCredits}
            step={step}
          />
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>{minCredits}</span>
            <span>{maxCredits}</span>
          </div>
        </div>

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[50, 100, 200, 500, 1000, 2000].map((amount) => (
            <Button
              key={amount}
              variant={credits === amount ? "default" : "outline"}
              size="sm"
              onClick={() => setCredits(amount)}
              className="min-w-16">
              {amount}
            </Button>
          ))}
        </div>

        {/* Price display */}
        <div className="bg-muted/50 rounded-xl p-4 text-center">
          <p className="text-sm text-muted-foreground mb-1">
            Số tiền thanh toán
          </p>
          <p className="text-2xl font-bold">{formatPrice(price)}</p>
          <p className="text-xs text-muted-foreground mt-1">
            ({formatPrice(pricePerCredit)} / credit)
          </p>
        </div>

        {/* Purchase button */}
        <Button
          className="w-full"
          size="lg"
          onClick={() => onPurchase(credits, price)}
          disabled={isLoading}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          {isLoading ? "Đang xử lý..." : "Thanh toán ngay"}
        </Button>
      </CardContent>
    </Card>
  );
}
