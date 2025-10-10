"use client";

import { FlashcardGroupCard } from "@/components/organisms/k/FlashCardGroup";
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
  TrendingUp,
  Clock,
  Target,
  Layers,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";

const flashcardGroups = [
  {
    id: "1",
    fileName: "Introduction to Machine Learning.pdf",
    cardCount: 45,
    createdAt: new Date("2024-01-15"),
    tags: ["AI", "Machine Learning"],
    progress: 75,
    lastStudied: new Date("2024-01-20"),
    difficulty: "intermediate" as const,
    isPinned: true,
  },
  {
    id: "2",
    fileName: "React Hooks Complete Guide.pdf",
    cardCount: 32,
    createdAt: new Date("2024-01-14"),
    tags: ["React", "Frontend"],
    progress: 100,
    lastStudied: new Date("2024-01-19"),
    difficulty: "beginner" as const,
    isPinned: false,
  },
  {
    id: "3",
    fileName: "Database Design Principles.pdf",
    cardCount: 28,
    createdAt: new Date("2024-01-13"),
    tags: ["Database", "SQL"],
    progress: 45,
    lastStudied: new Date("2024-01-18"),
    difficulty: "intermediate" as const,
    isPinned: false,
  },
  {
    id: "4",
    fileName: "Advanced TypeScript Patterns.pdf",
    cardCount: 56,
    createdAt: new Date("2024-01-12"),
    tags: ["TypeScript", "Programming"],
    progress: 30,
    lastStudied: new Date("2024-01-17"),
    difficulty: "advanced" as const,
    isPinned: true,
  },
  {
    id: "5",
    fileName: "Web Security Best Practices.pdf",
    cardCount: 41,
    createdAt: new Date("2024-01-11"),
    tags: ["Security", "Web Dev"],
    progress: 60,
    lastStudied: new Date("2024-01-16"),
    difficulty: "intermediate" as const,
    isPinned: false,
  },
  {
    id: "6",
    fileName: "System Design Interview Prep.pdf",
    cardCount: 67,
    createdAt: new Date("2024-01-10"),
    tags: ["System Design", "Interview"],
    progress: 20,
    lastStudied: new Date("2024-01-15"),
    difficulty: "advanced" as const,
    isPinned: false,
  },
];

export default function FlashcardsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("recent");

  const totalCards = flashcardGroups.reduce(
    (sum, group) => sum + group.cardCount,
    0,
  );
  const avgProgress = Math.round(
    flashcardGroups.reduce((sum, group) => sum + group.progress, 0)
    / flashcardGroups.length,
  );
  const studiedToday = flashcardGroups.filter(
    (g) => g.lastStudied.toDateString() === new Date().toDateString(),
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <div className="relative mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-start justify-between">
            <div className="flex gap-2">
              <Button className="gap-2 " asChild>
                <Link href="/k/ai-tool">
                  <Plus className="h-4 w-4" />
                  Tạo mới
                </Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-3">
              <Layers className="h-5 w-5 text-blue-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng số nhóm
              </p>
              <p className="mt-2 bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text text-3xl font-bold text-transparent">
                {flashcardGroups.length}
              </p>
              <Badge variant="outline" className="mt-2">
                +2 tuần này
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-3">
              <Target className="h-5 w-5 text-purple-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Tổng số thẻ
              </p>
              <p className="mt-2 bg-gradient-to-r from-gradient-via to-gradient-to bg-clip-text text-3xl font-bold text-transparent">
                {totalCards}
              </p>
              <Badge variant="outline" className="mt-2">
                {Math.round(totalCards / flashcardGroups.length)}
                {" "}
                thẻ/nhóm
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 p-3">
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Tiến độ trung bình
              </p>
              <p className="mt-2 bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-3xl font-bold text-transparent">
                {avgProgress}
                %
              </p>
              <Badge variant="outline" className="mt-2">
                +12% so với tuần trước
              </Badge>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg">
            <div className="absolute right-4 top-4 rounded-full bg-gradient-to-br from-orange-500/20 to-red-500/20 p-3">
              <Clock className="h-5 w-5 text-orange-500" />
            </div>
            <div className="relative">
              <p className="text-sm font-medium text-muted-foreground">
                Học hôm nay
              </p>
              <p className="mt-2 bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-3xl font-bold text-transparent">
                {studiedToday}
              </p>
              <Badge variant="outline" className="mt-2">
                Streak: 7 ngày 🔥
              </Badge>
            </div>
          </div>
        </div>

        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm flashcard..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sắp xếp theo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mới nhất</SelectItem>
                <SelectItem value="name">Tên A-Z</SelectItem>
                <SelectItem value="cards">Số thẻ</SelectItem>
                <SelectItem value="progress">Tiến độ</SelectItem>
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

        {flashcardGroups.some((g) => g.isPinned) && (
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-gradient-to-r from-gradient-from to-gradient-via" />
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Đã ghim
              </h2>
            </div>
            <div
              className={
                viewMode === "grid"
                  ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-4"
              }
            >
              {flashcardGroups
                .filter((g) => g.isPinned)
                .map((group) => (
                  <FlashcardGroupCard
                    key={group.id}
                    group={group}
                    viewMode={viewMode}
                  />
                ))}
            </div>
          </div>
        )}

        <div>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-gradient-to-r from-gradient-via to-gradient-to" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tất cả flashcards
            </h2>
          </div>
          <div
            className={
              viewMode === "grid"
                ? "grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }
          >
            {flashcardGroups
              .filter((g) => !g.isPinned)
              .map((group) => (
                <FlashcardGroupCard
                  key={group.id}
                  group={group}
                  viewMode={viewMode}
                />
              ))}
          </div>
        </div>

        {/* Empty State */}
        {flashcardGroups.length === 0 && (
          <div className="flex min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 p-8 text-center backdrop-blur-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-gradient-from/20 to-gradient-to/20">
              <Plus className="h-8 w-8 text-gradient-from" />
            </div>
            <h3 className="mt-6 text-xl font-semibold text-card-foreground">
              Chưa có flashcard nào
            </h3>
            <p className="mt-2 max-w-sm text-sm text-muted-foreground">
              Bắt đầu hành trình học tập của bạn bằng cách tạo nhóm flashcard
              đầu tiên từ file PDF
            </p>
            <Button
              className="mt-6 gap-2 bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to hover:opacity-90"
              asChild
            >
              <Link href="/k/ai-tool">
                <Plus className="h-4 w-4" />
                Tạo flashcard mới
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
