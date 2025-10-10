"use client";

import { useState } from "react";
import { Users, Clock, Calendar, BookOpen, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardIcon } from "@/components/atoms/k/CardIcon";
import { CardActionsMenu } from "@/components/atoms/k/CardActionsMenu";
import { StatItem } from "@/components/atoms/k/StatItem";
import { DateRangeDisplay } from "@/components/atoms/k/DateRangeDisplay";
import { StatusBadge, ExamRoomStatus } from "@/components/atoms/k/StatusBadge";
import { GradientButton } from "@/components/atoms/k/GradientButton";
import Link from "next/link";

interface ExamRoom {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  studentCount: number;
  duration: number;
  status: ExamRoomStatus;
  examName: string;
  completedCount: number;
  averageScore: number | null;
  tags: string[];
}

interface ExamRoomCardProps {
  room: ExamRoom;
  viewMode: "grid" | "list";
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onReopen?: (id: string) => void;
}

export function ExamRoomCard({
  room,
  viewMode,
  onEdit,
  onDelete,
  onReopen,
}: ExamRoomCardProps) {
  const [isHovered, setIsHovered] = useState(false);

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
                  icon={BookOpen}
                  variant="primary"
                  className="flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1 group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {room.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <StatusBadge status={room.status} />
                    <Badge
                      variant="secondary"
                      className="bg-primary/10 text-xs"
                    >
                      {room.examName}
                    </Badge>
                    {room.tags.map((tag) => (
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
                  icon={Users}
                  label="Học sinh"
                  value={`${room.completedCount}/${room.studentCount}`}
                  iconColor="blue-500"
                />
                <StatItem
                  icon={Clock}
                  label="Thời gian"
                  value={`${room.duration} phút`}
                  iconColor="purple-500"
                />
                <StatItem
                  icon={Calendar}
                  label="Hoàn thành"
                  value={`${Math.round(
                    (room.completedCount / room.studentCount) * 100,
                  )}%`}
                  iconColor="green-500"
                />
                <StatItem
                  icon={BookOpen}
                  label="Điểm TB"
                  value={
                    room.averageScore
                      ? `${room.averageScore.toFixed(1)}`
                      : "N/A"
                  }
                  iconColor="orange-500"
                />
              </div>

              {/* Date range */}
              <DateRangeDisplay
                startDate={room.startDate}
                endDate={room.endDate}
              />
            </div>

            {/* Right section - Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <Link href={`/k/manage-exam-room/${room.id}`}>
                <GradientButton icon={BookOpen} variant="purple" size="sm">
                  Chi tiết
                </GradientButton>
              </Link>

              <CardActionsMenu
                isPinned={false}
                onView={() => {}}
                onEdit={onEdit ? () => onEdit(room.id) : undefined}
                onPin={
                  room.status === "ended" && onReopen
                    ? () => onReopen(room.id)
                    : undefined
                }
                onDelete={onDelete ? () => onDelete(room.id) : undefined}
                viewLabel="Xem kết quả"
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
                onClick={onDelete ? () => onDelete(room.id) : undefined}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
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
          <CardIcon icon={BookOpen} variant="primary" />
          <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <CardActionsMenu
              isPinned={false}
              onView={() => {}}
              onEdit={onEdit ? () => onEdit(room.id) : undefined}
              onPin={
                room.status === "ended" && onReopen
                  ? () => onReopen(room.id)
                  : undefined
              }
              onDelete={onDelete ? () => onDelete(room.id) : undefined}
              viewLabel="Xem kết quả"
              className="h-8 w-8"
            />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={onDelete ? () => onDelete(room.id) : undefined}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-lg mb-3 line-clamp-2 group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
          {room.name}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <StatusBadge status={room.status} />
          <Badge variant="secondary" className="bg-primary/10 text-xs">
            {room.examName}
          </Badge>
          {room.tags.slice(0, 2).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatItem
            icon={Users}
            label="Học sinh"
            value={`${room.completedCount}/${room.studentCount}`}
            iconColor="blue-500"
          />
          <StatItem
            icon={Clock}
            label="Thời gian"
            value={`${room.duration}p`}
            iconColor="purple-500"
          />
          <StatItem
            icon={Calendar}
            label="Hoàn thành"
            value={`${Math.round(
              (room.completedCount / room.studentCount) * 100,
            )}%`}
            iconColor="green-500"
          />
          <StatItem
            icon={BookOpen}
            label="Điểm TB"
            value={
              room.averageScore ? `${room.averageScore.toFixed(1)}` : "N/A"
            }
            iconColor="orange-500"
          />
        </div>

        {/* Date Range */}
        <div className="mb-4 p-3 rounded-lg bg-muted/50">
          <DateRangeDisplay startDate={room.startDate} endDate={room.endDate} />
        </div>

        {/* Action Button */}
        <Link href={`/k/manage-exam-room/${room.id}`}>
          <GradientButton icon={BookOpen} variant="purple" className="w-full">
            Xem chi tiết
          </GradientButton>
        </Link>
      </div>
    </div>
  );
}
