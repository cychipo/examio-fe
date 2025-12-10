"use client";

import { use, useEffect, useState } from "react";
import {
  checkExamSessionAccessApi,
  getExamSessionPublicInfoApi,
  verifyExamSessionAccessCodeApi,
} from "@/apis/examSessionApi";
import {
  AccessCheckResult,
  ExamSessionPublicInfo,
  EXAM_SESSION_STATUS,
} from "@/types/examSession";
import { ExamRoomDetailTemplate } from "@/templates/ExamRoomDetailTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Lock, XCircle, Loader2, KeyRound } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

/**
 * Public Exam Session Page
 * Handles access control (public/code/whitelist) with strict security
 * NO session info is shown until access is fully verified
 */
export default function ExamSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  // States
  const [loading, setLoading] = useState(true);
  const [accessInfo, setAccessInfo] = useState<AccessCheckResult | null>(null);
  const [publicInfo, setPublicInfo] = useState<ExamSessionPublicInfo | null>(
    null
  );
  const [sessionNotFound, setSessionNotFound] = useState(false);

  // Code dialog
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");

  // Initial load - check access FIRST, only load info if has access
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Check access FIRST before loading any info
        const access = await checkExamSessionAccessApi(id);
        setAccessInfo(access);

        // Only load session info if has access
        if (access.hasAccess) {
          const info = await getExamSessionPublicInfoApi(id);
          setPublicInfo(info);
        } else if (access.accessType === "code_required") {
          // Show code dialog - don't load any info yet
          setShowCodeDialog(true);
        }
        // If denied, don't load any info - show access denied screen
      } catch (error: unknown) {
        console.error("Error loading exam session:", error);
        if ((error as any)?.response?.status === 404) {
          setSessionNotFound(true);
        } else {
          const message =
            (error as any)?.response?.data?.message ||
            (error as any)?.message ||
            "Không thể tải thông tin phiên thi";
          toast.error(message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadData();
    }
  }, [id]);

  // Handle code verification
  const handleVerifyCode = async () => {
    if (accessCode.length !== 6) {
      setCodeError("Mã truy cập phải có 6 chữ số");
      return;
    }

    setVerifying(true);
    setCodeError("");

    try {
      await verifyExamSessionAccessCodeApi(id, accessCode);

      // Load session info after successful verification
      const info = await getExamSessionPublicInfoApi(id);
      setPublicInfo(info);
      setAccessInfo({ hasAccess: true, accessType: "whitelist" });
      setShowCodeDialog(false);
      toast.success("Xác thực thành công!");
    } catch (_error) {
      setCodeError("Mã truy cập không đúng");
    } finally {
      setVerifying(false);
    }
  };

  // Handle back to home
  const handleGoHome = () => {
    router.push("/");
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not found
  if (sessionNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">
              Không tìm thấy phiên thi
            </h2>
            <p className="text-muted-foreground mb-4">
              Phiên thi này có thể đã bị xóa hoặc không tồn tại.
            </p>
            <Button variant="outline" onClick={handleGoHome}>
              Về trang chủ
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Code required - show dialog (non-dismissible)
  if (showCodeDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            showCloseButton={false}>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <KeyRound className="h-5 w-5" />
                Nhập mã truy cập
              </DialogTitle>
              <DialogDescription>
                Phiên thi này yêu cầu mã truy cập để tham gia
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  type="text"
                  placeholder="Nhập mã 6 chữ số"
                  value={accessCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setAccessCode(value);
                    setCodeError("");
                  }}
                  className={cn(
                    "text-center text-2xl tracking-widest font-mono",
                    codeError && "border-red-500"
                  )}
                  maxLength={6}
                  disabled={verifying}
                  autoFocus
                />
                {codeError && (
                  <p className="text-sm text-red-500 text-center">
                    {codeError}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleGoHome}
                  disabled={verifying}>
                  Quay lại
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleVerifyCode}
                  disabled={verifying || accessCode.length !== 6}>
                  {verifying ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang xác thực...
                    </>
                  ) : (
                    "Xác nhận"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Access denied - show denial screen (no session info)
  if (
    accessInfo &&
    !accessInfo.hasAccess &&
    accessInfo.accessType === "denied"
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Lock className="h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Phiên thi riêng tư</h2>
            <p className="text-muted-foreground mb-6">
              Bạn không có quyền truy cập phiên thi này.
            </p>
            <Button onClick={handleGoHome}>Về trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Has access but no public info loaded yet (shouldn't happen, but safety check)
  if (!publicInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Map data from BE to template format
  const examInfo = {
    title: publicInfo.title,
    subtitle: publicInfo.description || "Thi trực tuyến",
    duration: 120, // Will be calculated from settings
    totalQuestions: 50, // Will be fetched when starting exam
    passingScore: 70,
    attempts: "0/1",
  };

  const progress = {
    answered: 0,
    total: 50,
    marked: 0,
  };

  // Calculate time remaining based on status
  const calculateTimeRemaining = () => {
    if (publicInfo.status === EXAM_SESSION_STATUS.UPCOMING) {
      const startTime = new Date(publicInfo.startTime);
      const now = new Date();
      const diff = startTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
      }
    }

    if (
      publicInfo.status === EXAM_SESSION_STATUS.ONGOING &&
      publicInfo.endTime
    ) {
      const endTime = new Date(publicInfo.endTime);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
      }
    }

    return { hours: 2, minutes: 0, seconds: 0 };
  };

  const timeRemaining = calculateTimeRemaining();

  const examStartTime = new Date(publicInfo.startTime).toLocaleDateString(
    "vi-VN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const handleStartExam = () => {
    if (publicInfo.startTime > new Date().toISOString()) {
      toast.info("Phiên thi chưa bắt đầu. Vui lòng quay lại đúng giờ.");
      return;
    }
    if (publicInfo.endTime && publicInfo.endTime < new Date().toISOString()) {
      toast.info("Phiên thi đã kết thúc.");
      return;
    }
    // Navigate to exam quiz page
    router.push(`/exam-session/${id}/quiz`);
  };

  const handleContactProctor = () => {
    toast.info("Chức năng đang được phát triển");
  };

  const handleViewGuidelines = () => {
    toast.info("Chức năng đang được phát triển");
  };

  const handleTechnicalSupport = () => {
    toast.info("Chức năng đang được phát triển");
  };

  return (
    <ExamRoomDetailTemplate
      examInfo={examInfo}
      progress={progress}
      timeRemaining={timeRemaining}
      examStartTime={examStartTime}
      onStartExam={handleStartExam}
      onContactProctor={handleContactProctor}
      onViewGuidelines={handleViewGuidelines}
      onTechnicalSupport={handleTechnicalSupport}
    />
  );
}
