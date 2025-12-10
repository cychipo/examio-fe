"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Users,
  Trophy,
  AlertTriangle,
  BarChart3,
  Clock,
  CheckCircle2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "@/components/ui/toast";
import {
  ExamAttemptListItem,
  getExamAttemptsBySessionApi,
  getExamAttemptDetailApi,
  ExamAttemptDetail,
} from "@/apis/examAttemptApi";
import {
  getSessionCheatingStatsApi,
  CheatingSessionStats,
  CHEATING_TYPE_LABELS,
  CHEATING_TYPE,
  getUserAttemptsWithLogsApi,
  UserAttemptWithLogs,
} from "@/apis/cheatingLogApi";
import { getExamSessionByIdApi } from "@/apis/examSessionApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

// Attempt status enum
const ATTEMPT_STATUS = {
  IN_PROGRESS: 0,
  COMPLETED: 1,
  CANCELLED: 2,
};

// Chart colors
const CHART_COLORS = [
  "#3b82f6", // blue
  "#22c55e", // green
  "#eab308", // yellow
  "#f97316", // orange
  "#ef4444", // red
  "#8b5cf6", // purple
  "#06b6d4", // cyan
  "#ec4899", // pink
  "#64748b", // slate
  "#84cc16", // lime
];

const VIOLATION_COLORS: Record<string, string> = {
  TAB_SWITCH: "#ef4444",
  WINDOW_BLUR: "#f97316",
  DEVTOOLS_OPEN: "#dc2626",
  COPY_PASTE: "#ea580c",
  RIGHT_CLICK: "#f59e0b",
  FULLSCREEN_EXIT: "#d97706",
  PRINT_SCREEN: "#b91c1c",
};

/**
 * Session Analytics Page
 * Shows student rankings, violation stats, and detailed attempt info
 */
export default function SessionAnalyticsPage() {
  const params = useParams();
  const examRoomId = params.id as string;
  const sessionId = params.sessionId as string;

  // Data states
  const [loading, setLoading] = useState(true);
  const [sessionInfo, setSessionInfo] = useState<{
    title: string;
    passingScore: number;
    startTime: string;
    endTime?: string;
  } | null>(null);
  const [attempts, setAttempts] = useState<ExamAttemptListItem[]>([]);
  const [cheatingStats, setCheatingStats] = useState<CheatingSessionStats[]>(
    []
  );

  // Detail sheet
  const [selectedAttempt, setSelectedAttempt] =
    useState<ExamAttemptDetail | null>(null);
  const [selectedUserAttempts, setSelectedUserAttempts] = useState<
    UserAttemptWithLogs[]
  >([]);
  const [selectedLogs, setSelectedLogs] = useState<
    Array<{ type: string; description: string; totalCount: number }>
  >([]);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // Sorting
  const [sortField, setSortField] = useState<"score" | "violations">("score");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [sessionData, attemptsData, statsData] = await Promise.all([
          getExamSessionByIdApi(sessionId),
          getExamAttemptsBySessionApi(sessionId, 1, 100, true), // distinctUser=true to group by user
          getSessionCheatingStatsApi(sessionId),
        ]);

        setSessionInfo({
          title: sessionData.examRoom?.title || "Phiên thi",
          passingScore: (sessionData as any).passingScore || 0,
          startTime: sessionData.startTime,
          endTime: sessionData.endTime || undefined,
        });
        setAttempts(attemptsData.attempts);
        setCheatingStats(statsData);
      } catch (error: any) {
        console.error("Failed to load session data:", error);
        toast.error(error?.response?.data?.message || "Không thể tải dữ liệu");
      } finally {
        setLoading(false);
      }
    };

    if (sessionId) {
      fetchData();
    }
  }, [sessionId]);

  // Handle view attempt detail - optimized single API call
  const handleViewDetail = useCallback(
    async (userId: string) => {
      setLoadingDetail(true);
      setSheetOpen(true);
      try {
        // Single optimized API call to get all attempts with cheating logs
        const data = await getUserAttemptsWithLogsApi(sessionId, userId);

        setSelectedUserAttempts(data.attempts);
        setSelectedLogs(data.aggregatedLogs);

        // Get detail of the best attempt
        const bestAttempt = data.attempts.reduce((best, current) =>
          current.score > best.score ? current : best
        );

        // Load detail for the best attempt
        const detail = await getExamAttemptDetailApi(bestAttempt.id);
        setSelectedAttempt(detail);
      } catch (error) {
        console.error("Failed to load attempt detail:", error);
        toast.error("Không thể tải chi tiết");
      } finally {
        setLoadingDetail(false);
      }
    },
    [sessionId]
  );

  // Sort attempts - Backend already groups by user and returns best score
  const sortedAttempts = useMemo(() => {
    const completed = attempts.filter(
      (a) => a.status === ATTEMPT_STATUS.COMPLETED
    );

    return [...completed].sort((a, b) => {
      const aVal = sortField === "score" ? a.score : a.violationCount || 0;
      const bVal = sortField === "score" ? b.score : b.violationCount || 0;
      return sortOrder === "desc" ? bVal - aVal : aVal - bVal;
    });
  }, [attempts, sortField, sortOrder]);

  // Calculate stats
  const avgScore =
    sortedAttempts.length > 0
      ? sortedAttempts.reduce((sum, a) => sum + a.score, 0) /
        sortedAttempts.length
      : 0;

  const passedCount = sortedAttempts.filter(
    (a) => a.score >= (sessionInfo?.passingScore || 0)
  ).length;
  const totalViolations = cheatingStats.reduce(
    (sum, s) => sum + s.totalCount,
    0
  );

  // Score distribution data (1-10 scale) - based on best scores
  const scoreDistribution = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      range: `${i + 1}`,
      label: `${i * 10}-${(i + 1) * 10}%`,
      count: 0,
    }));

    sortedAttempts.forEach((a) => {
      const binIndex = Math.min(Math.floor(a.score / 10), 9);
      bins[binIndex].count++;
    });

    return bins;
  }, [sortedAttempts]);

  // Violation pie chart data
  const violationPieData = useMemo(() => {
    return cheatingStats.map((stat) => ({
      name: stat.description,
      value: stat.totalCount,
      type: stat.type,
    }));
  }, [cheatingStats]);

  // Toggle sort
  const toggleSort = (field: "score" | "violations") => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  // Format time
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/k/manage-exam-room">Quản lý Phòng thi</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href={`/k/manage-exam-room/${examRoomId}`}>
                {sessionInfo?.title || "Phòng thi"}
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Thống kê phiên thi</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Users className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-2xl font-bold">{sortedAttempts.length}</p>
              <p className="text-sm text-muted-foreground">
                Thí sinh hoàn thành
              </p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <BarChart3 className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-2xl font-bold">{avgScore.toFixed(1)}%</p>
              <p className="text-sm text-muted-foreground">Điểm trung bình</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <div>
              <p className="text-2xl font-bold">
                {passedCount}/{sortedAttempts.length}
              </p>
              <p className="text-sm text-muted-foreground">Đạt yêu cầu</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 py-4">
            <AlertTriangle className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-2xl font-bold">{totalViolations}</p>
              <p className="text-sm text-muted-foreground">Lượt vi phạm</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-500" />
              Phân bố điểm số
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistribution}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="range" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip
                    formatter={(value: number) => [
                      `${value} thí sinh`,
                      "Số lượng",
                    ]}
                    labelFormatter={(label) =>
                      `Điểm ${Number(label) * 10 - 10}-${Number(label) * 10}%`
                    }
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Violation Pie Chart */}
        {cheatingStats.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Thống kê vi phạm
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={violationPieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) =>
                        `${(name || "").substring(0, 10)}... ${(
                          (percent || 0) * 100
                        ).toFixed(0)}%`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value">
                      {violationPieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={
                            VIOLATION_COLORS[entry.type] ||
                            CHART_COLORS[index % CHART_COLORS.length]
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string) => [
                        `${value} lần`,
                        name,
                      ]}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Student Rankings Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Bảng xếp hạng thí sinh
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedAttempts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có thí sinh nào hoàn thành bài thi
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Hạng</TableHead>
                  <TableHead>Thí sinh</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("score")}>
                    <div className="flex items-center gap-1">
                      Điểm cao nhất
                      {sortField === "score" &&
                        (sortOrder === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thời gian làm</TableHead>
                  <TableHead
                    className="cursor-pointer select-none"
                    onClick={() => toggleSort("violations")}>
                    <div className="flex items-center gap-1">
                      Vi phạm
                      {sortField === "violations" &&
                        (sortOrder === "desc" ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronUp className="h-4 w-4" />
                        ))}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Chi tiết</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedAttempts.map((attempt, index) => {
                  const passed =
                    attempt.score >= (sessionInfo?.passingScore || 0);
                  const rank = index + 1;
                  return (
                    <TableRow key={attempt.user.id}>
                      <TableCell>
                        <span
                          className={`font-bold ${
                            rank === 1
                              ? "text-yellow-500"
                              : rank === 2
                              ? "text-gray-400"
                              : rank === 3
                              ? "text-amber-600"
                              : ""
                          }`}>
                          #{rank}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {attempt.user.name || attempt.user.username}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {attempt.user.email}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold">
                          {attempt.score.toFixed(1)}%
                        </span>
                        <span className="text-xs text-muted-foreground ml-1">
                          ({attempt.correctAnswers}/{attempt.totalQuestions})
                        </span>
                      </TableCell>
                      <TableCell className="flex items-center gap-x-2">
                        {passed ? (
                          <Badge variant="default" className="bg-green-500">
                            Đạt
                          </Badge>
                        ) : (
                          <Badge variant="destructive">Chưa đạt</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDuration(attempt.timeSpentSeconds)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {(attempt.violationCount || 0) > 0 ? (
                          <Badge
                            variant="outline"
                            className="text-red-500 border-red-500">
                            {attempt.violationCount}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">0</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDetail(attempt.user.id)}>
                          Xem
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Detail Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Chi tiết bài làm</SheetTitle>
            <SheetDescription>
              Xem thông tin chi tiết và các vi phạm
            </SheetDescription>
          </SheetHeader>

          {loadingDetail ? (
            <div className="space-y-4 mt-6">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : selectedAttempt ? (
            <div className="space-y-6 mt-6">
              {/* Student Info */}
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-lg font-bold">
                      {(
                        selectedAttempt.user.name ||
                        selectedAttempt.user.username
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold">
                      {selectedAttempt.user.name ||
                        selectedAttempt.user.username}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAttempt.user.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Summary - Best Score */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  Điểm cao nhất
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold text-primary">
                      {selectedAttempt.score.toFixed(1)}%
                    </p>
                    <p className="text-sm text-muted-foreground">Điểm số</p>
                  </div>
                  <div className="p-4 border rounded-lg text-center">
                    <p className="text-3xl font-bold">
                      {formatDuration(selectedAttempt.timeSpentSeconds)}
                    </p>
                    <p className="text-sm text-muted-foreground">Thời gian</p>
                  </div>
                </div>
              </div>

              {/* All Attempts History */}
              <div className="space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-500" />
                  Lịch sử làm bài ({selectedUserAttempts.length} lần)
                </h4>
                <div className="space-y-2">
                  {selectedUserAttempts
                    .sort(
                      (a, b) =>
                        new Date(b.startedAt).getTime() -
                        new Date(a.startedAt).getTime()
                    )
                    .map((attempt, index) => {
                      const passed =
                        attempt.score >= (sessionInfo?.passingScore || 0);
                      return (
                        <div
                          key={attempt.id}
                          className={`p-3 border rounded-lg ${
                            attempt.id === selectedAttempt.id
                              ? "bg-primary/5 border-primary"
                              : ""
                          }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">
                                Lần {selectedUserAttempts.length - index}
                              </span>
                              {attempt.id === selectedAttempt.id && (
                                <Badge
                                  variant="default"
                                  className="bg-yellow-500 text-xs">
                                  Cao nhất
                                </Badge>
                              )}
                            </div>
                            <Badge
                              variant={passed ? "default" : "destructive"}
                              className={passed ? "bg-green-500" : ""}>
                              {passed ? "Đạt" : "Chưa đạt"}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-muted-foreground">
                                Điểm:
                              </span>{" "}
                              <span className="font-bold">
                                {attempt.score.toFixed(1)}%
                              </span>
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Thời gian:
                              </span>{" "}
                              {formatDuration(attempt.timeSpentSeconds)}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Đúng:
                              </span>{" "}
                              {attempt.correctAnswers}/{attempt.totalQuestions}
                            </div>
                            <div>
                              <span className="text-muted-foreground">
                                Vi phạm:
                              </span>{" "}
                              <span
                                className={
                                  (attempt.violationCount || 0) > 0
                                    ? "text-red-500 font-semibold"
                                    : ""
                                }>
                                {attempt.violationCount || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground mt-2">
                            {format(
                              new Date(attempt.startedAt),
                              "HH:mm:ss dd/MM/yyyy"
                            )}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Violation Logs */}
              {selectedLogs.length > 0 ? (
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    Chi tiết vi phạm tổng hợp (
                    {selectedLogs.reduce(
                      (sum, log) => sum + log.totalCount,
                      0
                    )}{" "}
                    lần)
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Tổng hợp vi phạm từ tất cả {selectedUserAttempts.length} lần
                    thi
                  </p>
                  <div className="space-y-2">
                    {selectedLogs.map((log) => (
                      <div
                        key={log.type}
                        className="p-3 border border-red-200 bg-red-50 dark:bg-red-950/20 rounded-lg">
                        {" "}
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">
                              {CHEATING_TYPE_LABELS[
                                log.type as CHEATING_TYPE
                              ] || log.type}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {log.description}
                            </p>
                          </div>
                          <Badge variant="destructive">{log.totalCount}x</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-4 border rounded-lg text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p>Không có vi phạm</p>
                </div>
              )}
            </div>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
