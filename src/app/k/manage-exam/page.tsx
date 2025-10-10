"use client";

import { useState } from "react";
import {
  Search,
  Plus,
  Grid3x3,
  List,
  SlidersHorizontal,
  TrendingUp,
  TrendingDown,
  FileText,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TestCard } from "@/components/organisms/k/TestCard";

// Mock data
const mockTests = [
  {
    id: "1",
    fileName: "Toán học lớp 12 - Chương 1.pdf",
    questionCount: 25,
    createdAt: "2024-01-15",
    category: "Toán học",
    difficulty: "Trung bình",
    duration: 45,
    completionRate: 85,
    lastAttempt: "2024-01-20",
    bestScore: 92,
    attempts: 3,
    isPinned: true,
    tags: ["Đại số", "Giải tích"],
  },
  {
    id: "2",
    fileName: "Vật lý - Điện học cơ bản.pdf",
    questionCount: 30,
    createdAt: "2024-01-14",
    category: "Vật lý",
    difficulty: "Khó",
    duration: 60,
    completionRate: 70,
    lastAttempt: "2024-01-19",
    bestScore: 78,
    attempts: 5,
    isPinned: true,
    tags: ["Điện học", "Mạch điện"],
  },
  {
    id: "3",
    fileName: "Hóa học hữu cơ - Bài tập tổng hợp.pdf",
    questionCount: 20,
    createdAt: "2024-01-13",
    category: "Hóa học",
    difficulty: "Dễ",
    duration: 30,
    completionRate: 95,
    lastAttempt: "2024-01-18",
    bestScore: 100,
    attempts: 2,
    isPinned: false,
    tags: ["Hữu cơ", "Phản ứng"],
  },
  {
    id: "4",
    fileName: "Tiếng Anh - Grammar Advanced.pdf",
    questionCount: 40,
    createdAt: "2024-01-12",
    category: "Tiếng Anh",
    difficulty: "Khó",
    duration: 50,
    completionRate: 60,
    lastAttempt: "2024-01-17",
    bestScore: 85,
    attempts: 4,
    isPinned: false,
    tags: ["Grammar", "Nâng cao"],
  },
  {
    id: "5",
    fileName: "Lịch sử Việt Nam - Thế kỷ 20.pdf",
    questionCount: 35,
    createdAt: "2024-01-11",
    category: "Lịch sử",
    difficulty: "Trung bình",
    duration: 40,
    completionRate: 80,
    lastAttempt: "2024-01-16",
    bestScore: 88,
    attempts: 3,
    isPinned: false,
    tags: ["Lịch sử", "Việt Nam"],
  },
  {
    id: "6",
    fileName: "Sinh học - Di truyền học.pdf",
    questionCount: 28,
    createdAt: "2024-01-10",
    category: "Sinh học",
    difficulty: "Trung bình",
    duration: 45,
    completionRate: 75,
    lastAttempt: null,
    bestScore: null,
    attempts: 0,
    isPinned: false,
    tags: ["Di truyền", "ADN"],
  },
];

export default function TestsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("date");

  const pinnedTests = mockTests.filter((test) => test.isPinned);
  const regularTests = mockTests.filter((test) => !test.isPinned);

  const totalTests = mockTests.length;
  const totalQuestions = mockTests.reduce(
    (sum, test) => sum + test.questionCount,
    0,
  );
  const avgCompletion = Math.round(
    mockTests.reduce((sum, test) => sum + test.completionRate, 0)
    / mockTests.length,
  );
  const completedTests = mockTests.filter((test) => test.attempts > 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tạo đề mới
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +3
                </Badge>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-blue-600 bg-clip-text text-transparent">
                {totalTests}
              </div>
              <div className="text-sm text-muted-foreground">Tổng số đề</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/20">
                  <Target className="h-5 w-5 text-purple-500" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +12
                </Badge>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-purple-600 bg-clip-text text-transparent">
                {totalQuestions}
              </div>
              <div className="text-sm text-muted-foreground">Tổng câu hỏi</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-green-500/10 text-green-500 border-green-500/20"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +5%
                </Badge>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-green-500 to-green-600 bg-clip-text text-transparent">
                {avgCompletion}
                %
              </div>
              <div className="text-sm text-muted-foreground">Hoàn thành TB</div>
            </div>

            <div className="relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-orange-600/20">
                  <Clock className="h-5 w-5 text-orange-500" />
                </div>
                <Badge
                  variant="secondary"
                  className="bg-red-500/10 text-red-500 border-red-500/20"
                >
                  <TrendingDown className="h-3 w-3 mr-1" />
                  -1
                </Badge>
              </div>
              <div className="text-3xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                {completedTests}
              </div>
              <div className="text-sm text-muted-foreground">Đã làm bài</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card/50 backdrop-blur-sm rounded-xl p-4 border border-border/50">
            <div className="relative flex-1 w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đề kiểm tra..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/50"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full md:w-[180px] bg-background/50 border-border/50">
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Ngày tạo</SelectItem>
                  <SelectItem value="name">Tên đề</SelectItem>
                  <SelectItem value="questions">Số câu hỏi</SelectItem>
                  <SelectItem value="completion">Hoàn thành</SelectItem>
                  <SelectItem value="score">Điểm cao nhất</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-1 bg-background/50 rounded-lg p-1 border border-border/50">
                <Button
                  variant={viewMode === "grid" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className="h-8 w-8 p-0"
                >
                  <Grid3x3 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className="h-8 w-8 p-0"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Tests */}
        {pinnedTests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
                Đề đã ghim
              </span>
              <Badge variant="secondary" className="bg-primary/10">
                {pinnedTests.length}
              </Badge>
            </h2>
            <div
              className={`grid gap-4 ${
                viewMode === "grid"
                  ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                  : "grid-cols-1"
              }`}
            >
              {pinnedTests.map((test) => (
                <TestCard key={test.id} test={test} viewMode={viewMode} />
              ))}
            </div>
          </div>
        )}

        {/* All Tests */}
        <div>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              Tất cả đề kiểm tra
            </span>
            <Badge variant="secondary" className="bg-primary/10">
              {regularTests.length}
            </Badge>
          </h2>
          <div
            className={`grid gap-4 ${
              viewMode === "grid"
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                : "grid-cols-1"
            }`}
          >
            {regularTests.map((test) => (
              <TestCard key={test.id} test={test} viewMode={viewMode} />
            ))}
          </div>
        </div>

        {/* Empty State */}
        {mockTests.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-purple-500/20 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">
              Chưa có đề kiểm tra nào
            </h3>
            <p className="text-muted-foreground mb-6">
              Bắt đầu bằng cách tạo đề kiểm tra đầu tiên từ file PDF
            </p>
            <Button
              size="lg"
              className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Tạo đề kiểm tra
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
