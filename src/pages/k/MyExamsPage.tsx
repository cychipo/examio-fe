import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  PlayCircle,
  TrendingUp,
  Trophy,
  XCircle,
} from "lucide-react";
import { getRecentExamAttemptsApi, type RecentExamAttempt } from "@/apis/studentMaterialsApi";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

export default function MyExamsPage() {
  const { toast } = useToast();
  const [examAttempts, setExamAttempts] = useState<RecentExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailDialog, setDetailDialog] = useState<{ open: boolean; attempt: RecentExamAttempt | null }>({
    open: false,
    attempt: null,
  });

  const fetchExams = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getRecentExamAttemptsApi(20);
      setExamAttempts(data.examAttempts);
    } catch (error) {
      console.error("Failed to fetch exams:", error);
      toast.error("Không thể tải lịch sử thi");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchExams();
  }, [fetchExams]);

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><Clock className="h-3 w-3" />Đang làm</span>;
      case 1:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700"><CheckCircle className="h-3 w-3" />Hoàn thành</span>;
      case 2:
        return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="h-3 w-3" />Đã hủy</span>;
      default:
        return null;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 50) return "text-yellow-600";
    return "text-red-600";
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const allAttempts = [...examAttempts].sort((a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime());

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bài thi của tôi</h1>
          <p className="text-muted-foreground mt-1">Danh sách các bài thi và luyện tập gần đây</p>
        </div>
      </div>

      {allAttempts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Chưa có bài thi nào</p>
          <p className="text-sm text-muted-foreground mt-2">Tham gia phòng thi để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-4">
          {allAttempts.map((attempt) => {
            const title = attempt.examSession.examRoom.title;
            const score = attempt.score;
            const status = attempt.status;
            const totalQuestions = attempt.totalQuestions;
            const correctAnswers = attempt.correctAnswers;
            const violationCount = attempt.violationCount;

            return (
              <Card key={attempt.id} className="group hover:shadow-md transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-amber-500" />
                        <h3 className="font-semibold text-lg">{title}</h3>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1"><Calendar className="h-3 w-3" /><span>{formatTimeAgo(attempt.startedAt)}</span></div>
                        <span>•</span>
                        <span>Thi chính thức</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      {getStatusBadge(status)}
                      {violationCount > 0 && <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><AlertCircle className="h-3 w-3" />{violationCount} vi phạm</span>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1"><p className="text-xs text-muted-foreground">Điểm số</p><p className={`text-2xl font-bold ${score !== null ? getScoreColor(score) : ""}`}>{score !== null ? score.toFixed(1) : "N/A"}</p></div>
                    <div className="space-y-1"><p className="text-xs text-muted-foreground">Đúng/Tổng</p><p className="text-2xl font-bold">{correctAnswers}/{totalQuestions}</p></div>
                    <div className="space-y-1"><p className="text-xs text-muted-foreground">Tỷ lệ</p><p className="text-2xl font-bold">{totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0}%</p></div>
                  </div>

                  {score !== null && <Progress value={(correctAnswers / totalQuestions) * 100} className="h-2" />}

                  <div className="flex gap-2">
                    {status === 0 ? (
                      <Button onClick={() => window.location.assign(`/exam-session/${attempt.examSessionId}/quiz`)} className="flex-1" size="sm">
                        <PlayCircle className="h-4 w-4 mr-2" />
                        Tiếp tục làm bài
                      </Button>
                    ) : (
                      <Button onClick={() => setDetailDialog({ open: true, attempt })} variant="outline" className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog((prev) => ({ ...prev, open }))}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Chi tiết bài thi</DialogTitle></DialogHeader>
          {detailDialog.attempt && <ExamAttemptDetails attempt={detailDialog.attempt} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function ExamAttemptDetails({ attempt }: { attempt: RecentExamAttempt }) {
  const percentage = (attempt.correctAnswers / attempt.totalQuestions) * 100;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold">{attempt.examSession.examRoom.title}</h3>
        {attempt.examSession.examRoom.description && <p className="text-sm text-muted-foreground mt-1">{attempt.examSession.examRoom.description}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Card><CardContent className="pt-6"><div className="text-center space-y-2"><Trophy className="h-8 w-8 mx-auto text-amber-500" /><p className="text-3xl font-bold text-yellow-600">{attempt.score.toFixed(1)}</p><p className="text-xs text-muted-foreground">Điểm số</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center space-y-2"><TrendingUp className="h-8 w-8 mx-auto text-green-500" /><p className="text-3xl font-bold text-green-600">{percentage.toFixed(0)}%</p><p className="text-xs text-muted-foreground">Tỷ lệ đúng</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center space-y-2"><CheckCircle className="h-8 w-8 mx-auto text-primary" /><p className="text-3xl font-bold text-primary">{attempt.correctAnswers}/{attempt.totalQuestions}</p><p className="text-xs text-muted-foreground">Câu đúng</p></div></CardContent></Card>
        <Card><CardContent className="pt-6"><div className="text-center space-y-2"><AlertCircle className="h-8 w-8 mx-auto text-red-500" /><p className="text-3xl font-bold text-red-600">{attempt.violationCount}</p><p className="text-xs text-muted-foreground">Vi phạm</p></div></CardContent></Card>
      </div>

      <div className="space-y-2">
        <h4 className="font-semibold">Thông tin thời gian</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-muted-foreground">Bắt đầu:</span><span className="font-medium">{new Date(attempt.startedAt).toLocaleString("vi-VN")}</span></div>
          {attempt.finishedAt && <div className="flex justify-between"><span className="text-muted-foreground">Hoàn thành:</span><span className="font-medium">{new Date(attempt.finishedAt).toLocaleString("vi-VN")}</span></div>}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Tiến độ hoàn thành</span><span className="font-medium">{percentage.toFixed(1)}%</span></div>
        <Progress value={percentage} className="h-3" />
      </div>
    </div>
  );
}
