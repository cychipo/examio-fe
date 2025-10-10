"use client";

import { use } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Users,
  Clock,
  TrendingUp,
  Award,
  AlertTriangle,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";
import { StatusBadge } from "@/components/atoms/k/StatusBadge";
import { StatItem } from "@/components/atoms/k/StatItem";
import { GradientButton } from "@/components/atoms/k/GradientButton";
import { DateRangeDisplay } from "@/components/atoms/k/DateRangeDisplay";

interface StudentResult {
  id: string;
  name: string;
  email: string;
  score: number;
  completedAt: string;
  duration: number;
  violations: number;
  sessionDate: string;
}

const studentResults: StudentResult[] = [
  {
    id: "1",
    name: "Nguyễn Văn A",
    email: "nguyenvana@example.com",
    score: 8.5,
    completedAt: "2024-02-01 10:30",
    duration: 85,
    violations: 0,
    sessionDate: "2024-02-01",
  },
  {
    id: "2",
    name: "Trần Thị B",
    email: "tranthib@example.com",
    score: 7.2,
    completedAt: "2024-02-01 11:15",
    duration: 90,
    violations: 2,
    sessionDate: "2024-02-01",
  },
  {
    id: "3",
    name: "Lê Văn C",
    email: "levanc@example.com",
    score: 9.0,
    completedAt: "2024-02-02 09:45",
    duration: 82,
    violations: 0,
    sessionDate: "2024-02-02",
  },
  {
    id: "4",
    name: "Phạm Thị D",
    email: "phamthid@example.com",
    score: 6.8,
    completedAt: "2024-02-02 10:20",
    duration: 90,
    violations: 1,
    sessionDate: "2024-02-02",
  },
  {
    id: "5",
    name: "Hoàng Văn E",
    email: "hoangvane@example.com",
    score: 8.0,
    completedAt: "2024-02-03 14:30",
    duration: 88,
    violations: 0,
    sessionDate: "2024-02-03",
  },
];

export default function ExamRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const room = {
    id,
    name: "Phòng thi Giữa kỳ - Toán 10",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    studentCount: 45,
    duration: 90,
    status: "active" as const,
    examName: "Toán 10",
    completedCount: 32,
    averageScore: 7.7,
  };

  const groupedBySessions = studentResults.reduce((acc, result) => {
    if (!acc[result.sessionDate]) {
      acc[result.sessionDate] = [];
    }
    acc[result.sessionDate].push(result);
    return acc;
  }, {} as Record<string, StudentResult[]>);

  const sessionDates = Object.keys(groupedBySessions).sort().reverse();

  const getScoreColor = (score: number) => {
    if (score >= 8)
      return "text-green-500";
    if (score >= 6.5)
      return "text-yellow-500";
    return "text-red-500";
  };

  const getViolationColor = (violations: number) => {
    if (violations === 0)
      return "text-green-500";
    if (violations <= 2)
      return "text-yellow-500";
    return "text-red-500";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/k/manage-exam-room">
            <Button variant="ghost" className="mb-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Quay lại
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text text-transparent">
                {room.name}
              </h1>
              <div className="mt-3 flex items-center gap-3">
                <StatusBadge status={room.status} />
                <Badge variant="secondary" className="bg-primary/10">
                  {room.examName}
                </Badge>
                <DateRangeDisplay
                  startDate={room.startDate}
                  endDate={room.endDate}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <GradientButton icon={RefreshCw} variant="default">
                Mở lại phòng
              </GradientButton>
              <GradientButton icon={Download} variant="purple">
                Xuất báo cáo
              </GradientButton>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="p-6">
            <StatItem
              icon={Users}
              label="Học sinh tham gia"
              value={`${room.completedCount}/${room.studentCount}`}
              iconColor="blue-500"
            />
            <Progress
              value={(room.completedCount / room.studentCount) * 100}
              className="mt-3 h-2"
            />
          </Card>

          <Card className="p-6">
            <StatItem
              icon={Award}
              label="Điểm trung bình"
              value={room.averageScore.toFixed(1)}
              iconColor="green-500"
            />
            <Progress value={room.averageScore * 10} className="mt-3 h-2" />
          </Card>

          <Card className="p-6">
            <StatItem
              icon={Clock}
              label="Thời gian TB"
              value={`${Math.round(
                studentResults.reduce((sum, r) => sum + r.duration, 0)
                / studentResults.length,
              )}p`}
              iconColor="purple-500"
            />
          </Card>

          <Card className="p-6">
            <StatItem
              icon={AlertTriangle}
              label="Vi phạm"
              value={studentResults.reduce((sum, r) => sum + r.violations, 0)}
              iconColor="red-500"
            />
          </Card>
        </div>

        {/* Results by Session */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-gradient-from" />
            Kết quả theo phiên thi
          </h2>

          <Tabs defaultValue={sessionDates[0]} className="w-full">
            <TabsList className="mb-4">
              {sessionDates.map((date) => (
                <TabsTrigger key={date} value={date}>
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}
                  {" "}
                  (
                  {groupedBySessions[date].length}
                  )
                </TabsTrigger>
              ))}
            </TabsList>

            {sessionDates.map((date) => (
              <TabsContent key={date} value={date}>
                <div className="rounded-lg border border-border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>STT</TableHead>
                        <TableHead>Họ tên</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead className="text-center">Điểm</TableHead>
                        <TableHead className="text-center">
                          Thời gian làm
                        </TableHead>
                        <TableHead className="text-center">Vi phạm</TableHead>
                        <TableHead className="text-center">
                          Hoàn thành lúc
                        </TableHead>
                        <TableHead className="text-center">Thao tác</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupedBySessions[date]
                        .sort((a, b) => b.score - a.score)
                        .map((result, index) => (
                          <TableRow key={result.id}>
                            <TableCell className="font-medium">
                              {index + 1}
                            </TableCell>
                            <TableCell className="font-medium">
                              {result.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.email}
                            </TableCell>
                            <TableCell className="text-center">
                              <span
                                className={`font-bold text-lg ${getScoreColor(
                                  result.score,
                                )}`}
                              >
                                {result.score.toFixed(1)}
                              </span>
                            </TableCell>
                            <TableCell className="text-center">
                              {result.duration}
                              {" "}
                              phút
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={
                                  result.violations > 0
                                    ? "destructive"
                                    : "secondary"
                                }
                                className={getViolationColor(
                                  result.violations,
                                )}
                              >
                                {result.violations}
                                {" "}
                                lần
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center text-sm text-muted-foreground">
                              {result.completedAt}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm">
                                Xem chi tiết
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Session Stats */}
                <div className="mt-6 grid gap-4 sm:grid-cols-3">
                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Điểm TB phiên này
                    </div>
                    <div className="mt-2 text-2xl font-bold bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text text-transparent">
                      {(
                        groupedBySessions[date].reduce(
                          (sum, r) => sum + r.score,
                          0,
                        ) / groupedBySessions[date].length
                      ).toFixed(1)}
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Vi phạm phiên này
                    </div>
                    <div className="mt-2 text-2xl font-bold text-red-500">
                      {groupedBySessions[date].reduce(
                        (sum, r) => sum + r.violations,
                        0,
                      )}
                      {" "}
                      lần
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="text-sm text-muted-foreground">
                      Điểm cao nhất
                    </div>
                    <div className="mt-2 text-2xl font-bold text-green-500">
                      {Math.max(
                        ...groupedBySessions[date].map((r) => r.score),
                      ).toFixed(1)}
                    </div>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
