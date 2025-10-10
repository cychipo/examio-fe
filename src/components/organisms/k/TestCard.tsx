"use client";

import { useState } from "react";
import {
  Trash2,
  Play,
  Target,
  Clock,
  Award,
  TrendingUp,
  Pin as PinIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardIcon } from "@/components/atoms/k/CardIcon";
import { CardActionsMenu } from "@/components/atoms/k/CardActionsMenu";
import {
  DifficultyBadge,
  DifficultyLevel,
} from "@/components/atoms/k/DifficultyBadge";
import { ProgressBarWithLabel } from "@/components/atoms/k/ProgressBarWithLabel";
import { GradientButton } from "@/components/atoms/k/GradientButton";
import { StatItem } from "@/components/atoms/k/StatItem";

interface Test {
  id: string;
  fileName: string;
  questionCount: number;
  createdAt: string;
  category: string;
  difficulty: DifficultyLevel;
  duration: number;
  completionRate: number;
  lastAttempt: string | null;
  bestScore: number | null;
  attempts: number;
  isPinned: boolean;
  tags: string[];
}

interface TestCardProps {
  test: Test;
  viewMode: "grid" | "list";
}

export function TestCard({ test, viewMode }: TestCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getTimeSince = (dateString: string | null) => {
    if (!dateString)
      return "Chưa làm";
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0)
      return "Hôm nay";
    if (diffDays === 1)
      return "Hôm qua";
    if (diffDays < 7)
      return `${diffDays} ngày trước`;
    if (diffDays < 30)
      return `${Math.floor(diffDays / 7)} tuần trước`;
    return `${Math.floor(diffDays / 30)} tháng trước`;
  };

  if (viewMode === "list") {
    return (
      <div
        className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left section */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-3">
                <CardIcon
                  icon={Target}
                  variant="primary"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {test.fileName}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="secondary" className="bg-primary/10">
                      {test.category}
                    </Badge>
                    <DifficultyBadge difficulty={test.difficulty} />
                    {test.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                <StatItem
                  icon={Target}
                  label="Câu hỏi"
                  value={test.questionCount}
                  iconColor="blue-500"
                />
                <StatItem
                  icon={Clock}
                  label="Thời gian"
                  value={`${test.duration} phút`}
                  iconColor="purple-500"
                />
                <StatItem
                  icon={Award}
                  label="Điểm cao nhất"
                  value={test.bestScore ? `${test.bestScore}%` : "N/A"}
                  iconColor="green-500"
                />
                <StatItem
                  icon={TrendingUp}
                  label="Lần làm"
                  value={test.attempts}
                  iconColor="orange-500"
                />
              </div>

              {/* Progress bar */}
              <ProgressBarWithLabel
                value={test.completionRate}
                label="Tiến độ hoàn thành"
              />
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <GradientButton icon={Play} variant="purple" size="sm">
                Làm bài
              </GradientButton>

              <CardActionsMenu
                isPinned={test.isPinned}
                onView={() => console.log("View")}
                onEdit={() => console.log("Edit")}
                onPin={() => console.log("Pin")}
                onDelete={() => console.log("Delete")}
                className="h-9 w-9"
              />

              <Button
                variant="ghost"
                size="icon"
                className={`h-9 w-9 transition-all duration-300 ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-2"
                } hover:bg-destructive/10 hover:text-destructive`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>
                Tạo:
                {formatDate(test.createdAt)}
              </span>
              {test.lastAttempt && (
                <span>
                  Làm:
                  {getTimeSince(test.lastAttempt)}
                </span>
              )}
            </div>
            {test.isPinned && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                <PinIcon className="h-3 w-3 mr-1" />
                Đã ghim
              </Badge>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-border/50 bg-gradient-to-br from-card to-card/50 backdrop-blur-sm transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <CardIcon icon={Target} variant="primary" />
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <CardActionsMenu
              isPinned={test.isPinned}
              onView={() => console.log("View")}
              onEdit={() => console.log("Edit")}
              onPin={() => console.log("Pin")}
              onDelete={() => console.log("Delete")}
              className="h-8 w-8"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
          {test.fileName}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="bg-primary/10">
            {test.category}
          </Badge>
          <DifficultyBadge difficulty={test.difficulty} />
          {test.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatItem
            icon={Target}
            label="Câu hỏi"
            value={test.questionCount}
            iconColor="blue-500"
          />
          <StatItem
            icon={Clock}
            label="Thời gian"
            value={`${test.duration}p`}
            iconColor="purple-500"
          />
          <StatItem
            icon={Award}
            label="Điểm cao"
            value={test.bestScore ? `${test.bestScore}%` : "N/A"}
            iconColor="green-500"
          />
          <StatItem
            icon={TrendingUp}
            label="Lần làm"
            value={test.attempts}
            iconColor="orange-500"
          />
        </div>

        {/* Progress */}
        <ProgressBarWithLabel
          value={test.completionRate}
          label="Hoàn thành"
          className="mb-4"
        />

        {/* Action Button */}
        <GradientButton icon={Play} variant="purple" className="w-full">
          Làm bài kiểm tra
        </GradientButton>

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 text-xs text-muted-foreground">
          <span>{formatDate(test.createdAt)}</span>
          {test.isPinned && (
            <Badge
              variant="secondary"
              className="bg-primary/10 text-primary text-xs"
            >
              <PinIcon className="h-3 w-3" />
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}
