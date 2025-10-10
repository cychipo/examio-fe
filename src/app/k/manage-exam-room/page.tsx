"use client";

import { ExamRoomCard } from "@/components/organisms/k/ExamRoomCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Grid3x3,
  List,
  Users,
  Clock,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useState } from "react";

const examRooms = [
  {
    id: "1",
    name: "Phòng thi Giữa kỳ - Toán 10",
    startDate: "2024-02-01",
    endDate: "2024-02-05",
    studentCount: 45,
    duration: 90,
    status: "active" as const,
    examName: "Toán 10",
    completedCount: 32,
    averageScore: 7.5,
    tags: ["Giữa kỳ", "Toán"],
  },
  {
    id: "2",
    name: "Phòng thi Cuối kỳ - Văn 11",
    startDate: "2024-02-10",
    endDate: "2024-02-15",
    studentCount: 50,
    duration: 120,
    status: "upcoming" as const,
    examName: "Văn 11",
    completedCount: 0,
    averageScore: null,
    tags: ["Cuối kỳ", "Văn"],
  },
  {
    id: "3",
    name: "Kiểm tra 15 phút - Lý 12",
    startDate: "2024-01-20",
    endDate: "2024-01-22",
    studentCount: 38,
    duration: 15,
    status: "ended" as const,
    examName: "Lý 12",
    completedCount: 38,
    averageScore: 8.2,
    tags: ["Kiểm tra", "Lý"],
  },
  {
    id: "4",
    name: "Thi thử THPT Quốc Gia - Toán",
    startDate: "2024-02-03",
    endDate: "2024-02-04",
    studentCount: 120,
    duration: 90,
    status: "active" as const,
    examName: "Toán THPT",
    completedCount: 85,
    averageScore: 6.8,
    tags: ["Thi thử", "THPT QG"],
  },
  {
    id: "5",
    name: "Phòng thi Hóa 11 - Chương 3",
    startDate: "2024-01-15",
    endDate: "2024-01-18",
    studentCount: 42,
    duration: 45,
    status: "ended" as const,
    examName: "Hóa 11",
    completedCount: 40,
    averageScore: 7.9,
    tags: ["Kiểm tra", "Hóa"],
  },
  {
    id: "6",
    name: "Phòng thi Anh Văn - Speaking",
    startDate: "2024-02-20",
    endDate: "2024-02-25",
    studentCount: 30,
    duration: 20,
    status: "upcoming" as const,
    examName: "Anh 12",
    completedCount: 0,
    averageScore: null,
    tags: ["Speaking", "Anh"],
  },
];

export default function ExamRoomManagementPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterStatus, setFilterStatus] = useState("all");

  const totalRooms = examRooms.length;
  const activeRooms = examRooms.filter((r) => r.status === "active").length;
  const totalStudents = examRooms.reduce((sum, r) => sum + r.studentCount, 0);
  const avgCompletion = Math.round(
    examRooms.reduce(
      (sum, r) => sum + (r.completedCount / r.studentCount) * 100,
      0,
    ) / examRooms.length,
  );

  const filteredRooms = examRooms.filter((room) => {
    if (filterStatus !== "all" && room.status !== filterStatus)
      return false;
    if (
      searchQuery
      && !room.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text text-transparent">
                Quản lý phòng thi
              </h1>
              <p className="mt-2 text-muted-foreground">
                Tạo và quản lý phòng thi trực tuyến cho học sinh
              </p>
            </div>
            <Button className="gap-2 bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to hover:opacity-90">
              <Plus className="h-4 w-4" />
              Tạo phòng thi
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng phòng thi
              </p>
              <p className="mt-2 bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text text-3xl font-bold text-transparent">
                {totalRooms}
              </p>
              <Badge variant="secondary" className="mt-2">
                +
                {examRooms.filter((r) => r.status === "upcoming").length}
                {" "}
                sắp
                diễn ra
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Đang diễn ra
              </p>
              <p className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
                {activeRooms}
              </p>
              <Badge variant="secondary" className="mt-2">
                Hoạt động
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3">
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng học sinh
              </p>
              <p className="mt-2 bg-gradient-to-r from-gradient-via to-gradient-to bg-clip-text text-3xl font-bold text-transparent">
                {totalStudents}
              </p>
              <Badge variant="secondary" className="mt-2">
                Tham gia thi
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Hoàn thành TB
              </p>
              <p className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-3xl font-bold text-transparent">
                {avgCompletion}
                %
              </p>
              <Badge variant="secondary" className="mt-2">
                Tỷ lệ làm bài
              </Badge>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm phòng thi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="active">Đang diễn ra</SelectItem>
                <SelectItem value="upcoming">Sắp diễn ra</SelectItem>
                <SelectItem value="ended">Đã kết thúc</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mới nhất</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
                <SelectItem value="students">Số học sinh</SelectItem>
                <SelectItem value="completion">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>

            <Tabs
              value={viewMode}
              onValueChange={(v) => setViewMode(v as "grid" | "list")}
            >
              <TabsList>
                <TabsTrigger value="grid" className="gap-2">
                  <Grid3x3 className="h-4 w-4" />
                  Grid
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Exam Rooms Grid/List */}
        <div
          className={
            viewMode === "grid"
              ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
              : "space-y-4"
          }
        >
          {filteredRooms.map((room) => (
            <ExamRoomCard
              key={room.id}
              room={room}
              viewMode={viewMode}
              onEdit={(id) => console.log("Edit:", id)}
              onDelete={(id) => console.log("Delete:", id)}
              onReopen={(id) => console.log("Reopen:", id)}
            />
          ))}
        </div>

        {/* Empty State */}
        {filteredRooms.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from/20 to-gradient-to/20">
              <Calendar className="h-8 w-8 text-gradient-from" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-card-foreground">
              Không tìm thấy phòng thi
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Thử thay đổi bộ lọc hoặc tạo phòng thi mới
            </p>
            <Button className="mt-6 gap-2 bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to hover:opacity-90">
              <Plus className="h-4 w-4" />
              Tạo phòng thi mới
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
