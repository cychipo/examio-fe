"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, XCircle, Copy, Check } from "lucide-react";

interface PaymentWithQR {
  paymentId: string;
  amount: number;
  qrUrl: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

interface QRPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PaymentWithQR | null;
  onCheckStatus?: (paymentId: string) => Promise<{ status: number }>;
  onPaymentSuccess?: () => void; // Called when payment is successful
  pollInterval?: number; // ms, default 5000
}

export function QRPaymentDialog({
  open,
  onOpenChange,
  paymentData,
  onCheckStatus,
  onPaymentSuccess,
  pollInterval = 5000,
}: QRPaymentDialogProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "failed">(
    "pending"
  );
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open || !paymentData || !onCheckStatus) return;

    setStatus("pending");

    const checkPayment = async () => {
      try {
        const result = await onCheckStatus(paymentData.paymentId);
        if (result.status === 1) {
          setStatus("paid");
          // Call onPaymentSuccess after successful payment
          if (onPaymentSuccess) {
            onPaymentSuccess();
          }
        }
      } catch {
        // Ignore errors during polling
      }
    };

    const interval = setInterval(checkPayment, pollInterval);
    return () => clearInterval(interval);
  }, [open, paymentData, onCheckStatus, onPaymentSuccess, pollInterval]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!paymentData) return null;

  const transferContent = `EXAMIO${paymentData.paymentId}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">
            Thanh toán chuyển khoản
          </DialogTitle>
          <DialogDescription className="text-center">
            Quét mã QR hoặc chuyển khoản thủ công
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === "paid" ? (
            <div className="flex flex-col items-center py-6 text-green-500">
              <CheckCircle2 className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Thanh toán thành công!</p>
              <p className="text-sm text-muted-foreground">
                Credits đã được cộng vào tài khoản
              </p>
            </div>
          ) : status === "failed" ? (
            <div className="flex flex-col items-center py-6 text-red-500">
              <XCircle className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Thanh toán thất bại</p>
            </div>
          ) : (
            <>
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="bg-white p-3 rounded-xl">
                  <Image
                    src={paymentData.qrUrl}
                    alt="QR Code thanh toán"
                    width={192}
                    height={192}
                    unoptimized
                    className="w-48 h-48"
                  />
                </div>
              </div>

              {/* Amount */}
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {paymentData.amount.toLocaleString("vi-VN")} VND
                </p>
              </div>

              {/* Bank Info */}
              <div className="space-y-2 p-4 bg-muted/50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Ngân hàng</span>
                  <span className="font-medium">
                    {paymentData.bankInfo.bankName}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Số tài khoản</span>
                  <span className="font-medium">
                    {paymentData.bankInfo.accountNumber}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Tên TK</span>
                  <span className="font-medium">
                    {paymentData.bankInfo.accountName}
                  </span>
                </div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-muted-foreground">Nội dung CK</span>
                  <div className="flex items-center gap-2">
                    <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                      {transferContent}
                    </code>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6"
                      onClick={() => handleCopy(transferContent)}>
                      {copied ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Loading indicator */}
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Đang chờ thanh toán...</span>
              </div>
            </>
          )}

          <Button
            className="w-full"
            variant={status === "paid" ? "default" : "outline"}
            onClick={() => onOpenChange(false)}>
            {status === "paid" ? "Hoàn tất" : "Đóng"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
