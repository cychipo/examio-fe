"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  AreaChart,
  Area,
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
import {
  BookOpen,
  Layers,
  Award,
  RefreshCw,
  Trophy,
  Calendar,
  TrendingUp,
  ChevronDown
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getStudentStats, StudentDashboardStats } from "@/apis/statisticsApi";
import { StatCard } from "@/components/molecules/StatCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardStudentPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [isMounted, setIsMounted] = useState(false);
  const [statsMap, setStatsMap] = useState<Record<string, StudentDashboardStats>>({});
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>("7d");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect teachers to teacher dashboard
  useEffect(() => {
    if (user && user.role === "teacher") {
      router.replace("/k/dashboard-teacher");
    }
  }, [user, router]);

  const fetchStats = useCallback(async (selectedRange: string = range, forceRefresh: boolean = false) => {
    // Check if we have cached data for this range in local state
    if (!forceRefresh && statsMap[selectedRange]) {
      // If we have cached data, check if it's older than 10 minutes
      const cachedTime = new Date(statsMap[selectedRange].updatedAt).getTime();
      const tenMinutes = 10 * 60 * 1000;
      if (Date.now() - cachedTime < tenMinutes) {
        return;
      }
    }

    setLoading(true);
    try {
      const data = await getStudentStats(selectedRange);
      setStatsMap(prev => ({
        ...prev,
        [selectedRange]: data
      }));
    } catch (error) {
      console.error("Failed to fetch student stats:", error);
    } finally {
      setLoading(false);
    }
  }, [range, statsMap]);

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

  const examChartData = stats.examStats;
  const flashcardChartData = stats.flashcardStats;

  const pieData = [
    { name: "Lượt thi", value: stats.summary.totalExamAttempts },
    { name: "Lượt học Flashcard", value: stats.summary.totalFlashcardViews },
  ];

  return (
    <div className="p-6 space-y-8 bg-background min-h-screen pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard Học Sinh</h1>
          <p className="text-muted-foreground">
            Thống kê quá trình học tập và luyện thi của bạn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="w-[140px] justify-between">
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
          <Button onClick={() => fetchStats(range, true)} variant="outline" size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Tổng lượt thi"
          value={stats.summary.totalExamAttempts}
          icon={BookOpen}
          iconColor="text-blue-600"
          iconBgColor="bg-blue-100 dark:bg-blue-950"
          description="Thi chính thức trong phòng thi"
        />
        <StatCard
          title="Lượt học Flashcard"
          value={stats.summary.totalFlashcardViews}
          icon={Layers}
          iconColor="text-purple-600"
          iconBgColor="bg-purple-100 dark:bg-purple-950"
          description="Số lượt xem và học flashcard"
        />
        <StatCard
          title="Điểm trung bình"
          value={stats.summary.averageScore.toFixed(1)}
          icon={Award}
          iconColor="text-amber-600"
          iconBgColor="bg-amber-100 dark:bg-amber-950"
          description="Điểm TB các bài thi"
        />
        <StatCard
          title="Hoạt động"
          value={stats.summary.totalExamAttempts + stats.summary.totalFlashcardViews}
          icon={TrendingUp}
          iconColor="text-green-600"
          iconBgColor="bg-green-100 dark:bg-green-950"
          description="Tổng số hoạt động học tập"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Exam Stats Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Lượt thi theo thời gian</CardTitle>
                <CardDescription>
                  Thống kê lượt thi {range === "7d" ? "7 ngày qua" : "30 ngày qua"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={examChartData}>
                  <defs>
                    <linearGradient id="colorExams" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="examAttempts"
                    name="Thi chính thức"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExams)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Flashcard Stats Chart */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <Layers className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <CardTitle>Học Flashcard</CardTitle>
                <CardDescription>
                  Số lượt học flashcard {range === "7d" ? "7 ngày qua" : "30 ngày qua"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                  <AreaChart data={flashcardChartData}>
                  <defs>
                    <linearGradient id="colorFlashcards" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend iconType="circle" />
                  <Area
                    type="monotone"
                    dataKey="viewCount"
                    name="Lượt học"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorFlashcards)"
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Circle Chart - Summary */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Phân bổ hoạt động</CardTitle>
            <CardDescription>Tỷ lệ các hoạt động học tập của bạn</CardDescription>
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
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend layout="horizontal" verticalAlign="bottom" align="center" />
                </PieChart>
              </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Exam Scores */}
        <Card className="shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle>Điểm thi gần đây</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.recentScores.length > 0 ? (
                stats.recentScores.map((score, index) => (
                  <div key={index} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
                        score.score >= 80 ? 'bg-green-500/10 text-green-600' :
                        score.score >= 50 ? 'bg-amber-500/10 text-amber-600' :
                        'bg-red-500/10 text-red-600'
                      }`}>
                        {score.score.toFixed(0)}
                      </div>
                      <span className="font-medium text-sm line-clamp-1">{score.day}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-sm font-bold ${
                        score.score >= 80 ? 'text-green-600' :
                        score.score >= 50 ? 'text-amber-600' :
                        'text-red-600'
                      }`}>{score.score.toFixed(1)}</span>
                      <span className="text-[10px] text-muted-foreground">/100</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-center text-muted-foreground py-10">Chưa có dữ liệu điểm</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center py-4">
        <p className="text-xs text-muted-foreground italic">
          Dữ liệu được cập nhật lúc: {new Date(stats.updatedAt).toLocaleString()}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map(i => (
          <Skeleton key={i} className="h-32 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-[400px] rounded-xl" />
        <Skeleton className="h-[400px] rounded-xl" />
      </div>
    </div>
  );
}
