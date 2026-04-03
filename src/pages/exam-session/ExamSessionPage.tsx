import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  checkExamSessionAccessApi,
  verifyExamSessionAccessCodeApi,
  getExamSessionStatsApi,
  type ExamSessionStats,
} from "@/apis/examSessionApi";
import { EXAM_SESSION_STATUS, type AccessCheckResult } from "@/types/examSession";
import { ExamRoomDetailTemplate } from "@/templates/ExamRoomDetailTemplate";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { KeyRound, Loader2, Lock, XCircle } from "lucide-react";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";

export default function ExamSessionPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [accessInfo, setAccessInfo] = useState<AccessCheckResult | null>(null);
  const [stats, setStats] = useState<ExamSessionStats | null>(null);
  const [sessionNotFound, setSessionNotFound] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [codeError, setCodeError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const access = await checkExamSessionAccessApi(id);
        setAccessInfo(access);

        if (access.hasAccess) {
          const sessionStats = await getExamSessionStatsApi(id);
          setStats(sessionStats);
        } else if (access.accessType === "code_required") {
          setShowCodeDialog(true);
        }
      } catch (error: any) {
        console.error("Error loading exam session:", error);
        if (error?.response?.status === 404) {
          setSessionNotFound(true);
        } else {
          const message =
            error?.response?.data?.message ||
            error?.message ||
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

  const handleVerifyCode = async () => {
    if (accessCode.length !== 6) {
      setCodeError("Mã truy cập phải có 6 chữ số");
      return;
    }

    setVerifying(true);
    setCodeError("");

    try {
      await verifyExamSessionAccessCodeApi(id, accessCode);
      const sessionStats = await getExamSessionStatsApi(id);
      setStats(sessionStats);
      setAccessInfo({ hasAccess: true, accessType: "whitelist" });
      setShowCodeDialog(false);
      toast.success("Xác thực thành công!");
    } catch {
      setCodeError("Mã truy cập không đúng");
    } finally {
      setVerifying(false);
    }
  };

  const handleGoHome = () => {
    navigate("/");
  };

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
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (sessionNotFound) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <XCircle className="h-16 w-16 text-red-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Không tìm thấy phiên thi</h2>
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

  if (showCodeDialog) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Dialog open={true} onOpenChange={() => {}}>
          <DialogContent
            className="sm:max-w-md"
            onPointerDownOutside={(e) => e.preventDefault()}
            onEscapeKeyDown={(e) => e.preventDefault()}
            showCloseButton={false}
          >
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
                <div className="flex justify-center">
                  <InputOTP
                    maxLength={6}
                    value={accessCode}
                    onChange={(value) => {
                      setAccessCode(value);
                      setCodeError("");
                    }}
                    disabled={verifying}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                      <InputOTPSlot index={1} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                      <InputOTPSlot index={2} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                    </InputOTPGroup>
                    <InputOTPSeparator />
                    <InputOTPGroup>
                      <InputOTPSlot index={3} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                      <InputOTPSlot index={4} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                      <InputOTPSlot index={5} className={cn("h-12 w-12 text-lg", codeError && "border-red-500")} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                {codeError && <p className="text-sm text-red-500 text-center">{codeError}</p>}
              </div>

              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={handleGoHome} disabled={verifying}>
                  Quay lại
                </Button>
                <Button className="flex-1" onClick={handleVerifyCode} disabled={verifying || accessCode.length !== 6}>
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

  if (accessInfo && !accessInfo.hasAccess && accessInfo.accessType === "denied") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Lock className="h-16 w-16 text-orange-500 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Phiên thi riêng tư</h2>
            <p className="text-muted-foreground mb-6">Bạn không có quyền truy cập phiên thi này.</p>
            <Button onClick={handleGoHome}>Về trang chủ</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const formatAttempts = (): string => {
    if (stats.maxAttempts === null) {
      return stats.currentAttempt === 0 ? "Lần đầu" : `Lần ${stats.currentAttempt}`;
    }

    const nextAttempt = stats.currentAttempt + 1;
    return `${nextAttempt}/${stats.maxAttempts}`;
  };

  const formatDuration = (): number | string => {
    if (stats.durationMinutes === null) {
      return "Không giới hạn";
    }
    return stats.durationMinutes;
  };

  const formatPassingScore = (): number | string => {
    if (stats.passingScore === 0) {
      return "Không có";
    }
    return stats.passingScore;
  };

  const examInfo = {
    title: stats.title,
    subtitle: stats.description || "Thi trực tuyến",
    duration: typeof formatDuration() === "number" ? (formatDuration() as number) : 0,
    totalQuestions: stats.totalQuestions,
    passingScore: typeof formatPassingScore() === "number" ? (formatPassingScore() as number) : 0,
    attempts: formatAttempts(),
  };

  const calculateTimeRemaining = () => {
    if (!stats.endTime) {
      return null;
    }

    if (stats.status === EXAM_SESSION_STATUS.UPCOMING) {
      const startTime = new Date(stats.startTime);
      const now = new Date();
      const diff = startTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
      }
    }

    if (stats.status === EXAM_SESSION_STATUS.ONGOING && stats.endTime) {
      const endTime = new Date(stats.endTime);
      const now = new Date();
      const diff = endTime.getTime() - now.getTime();

      if (diff > 0) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { hours, minutes, seconds };
      }
    }

    return null;
  };

  const examStartTime = new Date(stats.startTime).toLocaleDateString("vi-VN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const handleStartExam = () => {
    if (stats.startTime > new Date().toISOString()) {
      toast.info("Phiên thi chưa bắt đầu. Vui lòng quay lại đúng giờ.");
      return;
    }
    if (stats.endTime && stats.endTime < new Date().toISOString()) {
      toast.info("Phiên thi đã kết thúc.");
      return;
    }
    navigate(`/exam-session/${id}/quiz`);
  };

  return (
    <ExamRoomDetailTemplate
      examInfo={examInfo}
      progress={stats.progress}
      timeRemaining={calculateTimeRemaining()}
      examStartTime={examStartTime}
      onStartExam={handleStartExam}
    />
  );
}
