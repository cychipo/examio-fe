"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  BookOpen,
  Layers,
  Award,
  Users,
  RefreshCw,
  Trophy,
  Calendar,
  ChevronDown,
  Activity,
  Eye,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getTeacherStats, TeacherDashboardStats } from "@/apis/statisticsApi";
import { StatCard } from "@/components/molecules/StatCard";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardTeacherPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [statsMap, setStatsMap] = useState<
    Record<string, TeacherDashboardStats>
  >({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>("7d");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect students to /k page
  useEffect(() => {
    if (user && user.role === "student") {
      router.replace("/k");
    }
  }, [user, router]);

  const fetchStats = useCallback(
    async (selectedRange: string = range, forceRefresh: boolean = false) => {
      // Check if we have cached data for this range in local state
      if (!forceRefresh && statsMap[selectedRange]) {
        // If we have cached data, check if it's older than 10 minutes
        const cachedTime = new Date(
          statsMap[selectedRange].updatedAt,
        ).getTime();
        const tenMinutes = 10 * 60 * 1000;
        if (Date.now() - cachedTime < tenMinutes) {
          return;
        }
      }

      setLoading(true);
      try {
        const data = await getTeacherStats(selectedRange);
        setStatsMap((prev) => ({
          ...prev,
          [selectedRange]: data,
        }));
      } catch (error) {
        console.error("Failed to fetch teacher stats:", error);
      } finally {
        setLoading(false);
      }
    },
    [range, statsMap],
  );

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const stats = statsMap[range];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Không thể tải dữ liệu thống kê.</p>
        <Button onClick={() => fetchStats(range, true)} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Thử lại
        </Button>
      </div>
    );
  }

  const creationChartData = stats.creationStats;
  const activityChartData = stats.activityStats;

  const pieData = [
    { name: "Đề thi", value: stats.summary.totalQuizSets },
    { name: "Bộ Flashcard", value: stats.summary.totalFlashcardSets },
    { name: "Phòng thi", value: stats.summary.totalExamRooms },
  ];

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Giáo Viên
          </h1>
          <p className="text-muted-foreground">
            Thống kê hiệu quả giảng dạy và tài liệu học tập của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="w-[140px] justify-between"
              >
                {range === "7d" ? "7 ngày qua" : "30 ngày qua"}
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setRange("7d")}>
                7 ngày qua
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setRange("30d")}>
                30 ngày qua
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            onClick={() => fetchStats(range, true)}
            variant="outline"
            size="sm"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />{" "}
            Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          title="Tổng số Đề thi"
          value={stats.summary.totalQuizSets}
          icon={BookOpen}
          iconColor="text-primary"
          iconBgColor="bg-red-100"
          description="Đã được tạo trong hệ thống"
        />
        <StatCard
          title="Tổng số Flashcard"
          value={stats.summary.totalFlashcardSets}
          icon={Layers}
          iconColor="text-green-600"
          iconBgColor="bg-green-100"
          description="Các bộ thẻ ghi nhớ đang hoạt động"
        />
        <StatCard
          title="Phòng thi đang mở"
          value={stats.summary.totalExamRooms}
          icon={Users}
          iconColor="text-yellow-600"
          iconBgColor="bg-yellow-100"
          description="Số lượng phòng thi của bạn"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Creation Line Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Tài liệu tạo mới</CardTitle>
                <CardDescription>
                  Số lượng đề thi và flashcard tạo trong{" "}
                  {range === "7d" ? "7 ngày qua" : "30 ngày qua"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={creationChartData}>
                    <defs>
                      <linearGradient
                        id="colorQuiz"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#3b82f6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#3b82f6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorFlash"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#10b981"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#10b981"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="quizSets"
                      name="Đề thi"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorQuiz)"
                    />
                    <Area
                      type="monotone"
                      dataKey="flashcardSets"
                      name="Flashcard"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFlash)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Activity Line Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-500/10 rounded-lg">
                <Activity className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Hoạt động của học sinh</CardTitle>
                <CardDescription>
                  Số lượt thi trong{" "}
                  {range === "7d" ? "7 ngày qua" : "30 ngày qua"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={activityChartData}>
                    <defs>
                      <linearGradient
                        id="colorExam"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#f59e0b"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#f59e0b"
                          stopOpacity={0}
                        />
                      </linearGradient>
                      <linearGradient
                        id="colorFlashcard"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#8b5cf6"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="#8b5cf6"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      opacity={0.3}
                    />
                    <XAxis
                      dataKey="day"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "#888", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        border: "none",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Legend iconType="circle" />
                    <Area
                      type="monotone"
                      dataKey="examAttempts"
                      name="Lượt thi"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorExam)"
                    />
                    <Area
                      type="monotone"
                      dataKey="flashcardViews"
                      name="Lượt học thẻ"
                      stroke="#8b5cf6"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorFlashcard)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Circle Chart - Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Phân bổ tài nguyên</CardTitle>
            <CardDescription>
              Tỷ lệ các loại tài liệu bạn sở hữu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend
                      layout="horizontal"
                      verticalAlign="bottom"
                      align="center"
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Rooms by Participants */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <CardTitle>Phòng thi đông nhất</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topRoomsByParticipants.length > 0 ? (
                stats.topRoomsByParticipants.map((room, index) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm line-clamp-1">
                        {room.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground font-semibold">
                      <span>{room.participants}</span>
                      <Users className="h-3 w-3" />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-10">
                  Chưa có dữ liệu phòng thi
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Rooms by Average Score */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              <CardTitle>Điểm trung bình cao</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topRoomsByAvgScore.length > 0 ? (
                stats.topRoomsByAvgScore.map((room, index) => (
                  <div
                    key={room.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/10 text-amber-500 text-sm font-bold">
                        {index + 1}
                      </div>
                      <span className="font-medium text-sm line-clamp-1">
                        {room.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-bold text-yellow-600">
                        {room.avgScore}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        /100
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-10">
                  Chưa có dữ liệu điểm
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Flashcards */}
      <Card className="shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <CardTitle>Top Flashcard được quan tâm</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {stats.topFlashcardSets.length > 0 ? (
              stats.topFlashcardSets.map((set, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  key={set.id}
                  className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Eye className="h-12 w-12" />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded bg-yellow-500/20 text-yellow-600">
                      #{index + 1}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 h-10">
                    {set.title}
                  </h3>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Eye className="h-3 w-3" />
                    <span className="text-xs">
                      {set.viewCount.toLocaleString()} lượt xem
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-muted-foreground">
                Chưa có dữ liệu flashcard
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground italic">
          Dữ liệu được cập nhật lúc:{" "}
          {new Date(stats.updatedAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-8 animate-pulse">
      <div className="space-y-2">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
