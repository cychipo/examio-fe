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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
    bank_full_name: string;
    account_full_name: string;
    account_number: string;
    account_holder_name: string;
  };
}

interface QRPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentData: PaymentWithQR | null;
  onCheckStatus?: (paymentId: string) => Promise<{ status: number }>;
  onPaymentSuccess?: () => void;
  onCancelPayment?: (paymentId: string) => Promise<void>;
  pollInterval?: number;
}

export function QRPaymentDialog({
  open,
  onOpenChange,
  paymentData,
  onCheckStatus,
  onPaymentSuccess,
  onCancelPayment,
  pollInterval = 5000,
}: QRPaymentDialogProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "failed">(
    "pending",
  );
  const [copied, setCopied] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (!open || !paymentData || !onCheckStatus) return;

    setStatus("pending");

    const checkPayment = async () => {
      try {
        const result = await onCheckStatus(paymentData.paymentId);
        if (result.status === 1) {
          setStatus("paid");
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

  // Handle close button click
  const handleCloseClick = () => {
    if (status === "paid") {
      // If already paid, just close
      onOpenChange(false);
    } else if (status === "pending" && paymentData) {
      // If pending, show confirmation dialog
      setShowCancelConfirm(true);
    } else {
      onOpenChange(false);
    }
  };

  // Handle confirm cancel
  const handleConfirmCancel = async () => {
    if (!paymentData || !onCancelPayment) {
      onOpenChange(false);
      setShowCancelConfirm(false);
      return;
    }

    setIsCancelling(true);
    try {
      await onCancelPayment(paymentData.paymentId);
    } catch {
      // Ignore errors - payment might already be processed
    } finally {
      setIsCancelling(false);
      setShowCancelConfirm(false);
      onOpenChange(false);
    }
  };

  // Handle dialog close via overlay click or escape
  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen && status === "pending" && paymentData) {
      // Trying to close while pending - show confirmation
      setShowCancelConfirm(true);
    } else {
      onOpenChange(newOpen);
    }
  };

  if (!paymentData) return null;

  const transferContent = `KMAEDU${paymentData.paymentId.toUpperCase()}`;

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
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
                  <div className="flex justify-between items-start gap-x-2">
                    <span className="text-muted-foreground min-w-fit">
                      Ngân hàng
                    </span>
                    <span className="font-medium line-clamp-1">
                      {paymentData.bankInfo.bank_full_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-x-2">
                    <span className="text-muted-foreground">Số tài khoản</span>
                    <span className="font-medium">
                      {paymentData.bankInfo.account_number}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-x-2">
                    <span className="text-muted-foreground">Tên TK</span>
                    <span className="font-medium">
                      {paymentData.bankInfo.account_holder_name}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-x-2 gap-2">
                    <span className="text-muted-foreground">Nội dung CK</span>
                    <div className="flex items-center gap-2">
                      <code className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                        {transferContent.toUpperCase()}
                      </code>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() =>
                          handleCopy(transferContent.toUpperCase())
                        }
                      >
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
              onClick={handleCloseClick}
            >
              {status === "paid" ? "Hoàn tất" : "Đóng"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Cancel Confirmation Dialog */}
      <AlertDialog open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialogContent className="bg-background/95 backdrop-blur-xl border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Hủy thanh toán?</AlertDialogTitle>
            <AlertDialogDescription>
              Nếu bạn đóng, giao dịch này sẽ bị hủy. Bạn có chắc chắn muốn hủy
              thanh toán không?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="bg-black/5 border-border cursor-pointer"
              disabled={isCancelling}
            >
              Tiếp tục thanh toán
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmCancel}
              disabled={isCancelling}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
            >
              {isCancelling ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Đang hủy...
                </>
              ) : (
                "Hủy thanh toán"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
