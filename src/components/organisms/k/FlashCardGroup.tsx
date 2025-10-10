"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Layers,
  Zap,
  Pin as PinIcon,
  Calendar,
  Clock,
} from "lucide-react";
import { CardIcon } from "@/components/atoms/k/CardIcon";
import { CardActionsMenu } from "@/components/atoms/k/CardActionsMenu";
import {
  DifficultyBadge,
  DifficultyLevel,
} from "@/components/atoms/k/DifficultyBadge";
import { ProgressBarWithLabel } from "@/components/atoms/k/ProgressBarWithLabel";
import { GradientButton } from "@/components/atoms/k/GradientButton";
import { Button } from "@/components/ui/button";

interface FlashcardGroup {
  id: string;
  fileName: string;
  cardCount: number;
  createdAt: Date;
  tags?: string[];
  progress?: number;
  lastStudied?: Date;
  difficulty?: DifficultyLevel;
  isPinned?: boolean;
}

interface FlashcardGroupCardProps {
  group: FlashcardGroup;
  viewMode?: "grid" | "list";
}

export function FlashcardGroupCard({
  group,
  viewMode = "grid",
}: FlashcardGroupCardProps) {
  const handleDelete = () => {
    console.log("Delete group:", group.id);
  };

  const handleEdit = () => {
    console.log("Edit group:", group.id);
  };

  const handleView = () => {
    console.log("View group:", group.id);
  };

  const handlePin = () => {
    console.log("Pin group:", group.id);
  };

  if (viewMode === "list") {
    return (
      <Card className="group relative overflow-hidden transition-all hover:shadow-xl hover:shadow-gradient-from/10">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-gradient-from/5 via-gradient-via/5 to-gradient-to/5 opacity-0 transition-opacity group-hover:opacity-100" />
        <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gradient-from via-gradient-via to-gradient-to opacity-0 transition-opacity group-hover:opacity-100" />

        <div className="relative flex items-center gap-6 p-6">
          {/* Icon */}
          <CardIcon icon={FileText} variant="gradient" className="h-14 w-14" />

          {/* Content */}
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-card-foreground group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {group.fileName}
                  </h3>
                  {group.isPinned && (
                    <PinIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  )}
                </div>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {group.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {group.difficulty && (
                    <DifficultyBadge difficulty={group.difficulty} />
                  )}
                </div>
              </div>

              <CardActionsMenu
                isPinned={group.isPinned}
                onView={handleView}
                onEdit={handleEdit}
                onPin={handlePin}
                onDelete={handleDelete}
                viewLabel="Xem flashcards"
              />
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Layers className="h-4 w-4" />
                <span className="font-medium">
                  {group.cardCount}
                  {" "}
                  thẻ
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>
                  {new Date(group.createdAt).toLocaleDateString("vi-VN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
              {group.lastStudied && (
                <div className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  <span>
                    Học
                    {" "}
                    {new Date(group.lastStudied).toLocaleDateString("vi-VN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                </div>
              )}
            </div>

            {group.progress !== undefined && (
              <ProgressBarWithLabel
                value={group.progress}
                label="Tiến độ học tập"
              />
            )}
          </div>
        </div>
        <div className="flex justify-end mr-4 pb-4">
          <GradientButton icon={Zap} onClick={handleView} className="w-fit">
            Học ngay
          </GradientButton>
        </div>
      </Card>
    );
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-2xl hover:shadow-gradient-from/20">
      {/* Gradient border effect */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-gradient-from via-gradient-via to-gradient-to opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="absolute inset-[1px] rounded-lg bg-card" />

      <div className="relative p-6">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between gap-3">
          <CardIcon
            icon={FileText}
            variant="gradient"
            className="h-12 w-12 shadow-lg"
          />

          <div className="flex gap-1">
            {group.isPinned && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-transparent cursor-pointer"
              >
                <PinIcon className="h-4 w-4 fill-yellow-500 text-yellow-500" />
              </Button>
            )}
            <CardActionsMenu
              isPinned={group.isPinned}
              onView={handleView}
              onEdit={handleEdit}
              onPin={handlePin}
              onDelete={handleDelete}
              viewLabel="Xem flashcards"
              className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
            />
          </div>
        </div>

        {/* File name */}
        <h3 className="mb-3 line-clamp-2 text-lg font-semibold leading-tight text-card-foreground group-hover:bg-gradient-to-r group-hover:from-gradient-from group-hover:to-gradient-via group-hover:bg-clip-text group-hover:text-transparent transition-all">
          {group.fileName}
        </h3>

        {/* Tags */}
        {group.tags && group.tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {group.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Progress bar */}
        {group.progress !== undefined && (
          <ProgressBarWithLabel
            value={group.progress}
            label="Tiến độ"
            className="mb-4"
          />
        )}

        {/* Metadata */}
        <div className="space-y-2 border-t border-border pt-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Layers className="h-4 w-4" />
              <span className="bg-gradient-to-r from-gradient-from to-gradient-via bg-clip-text font-semibold text-transparent">
                {group.cardCount}
                {" "}
                thẻ
              </span>
            </div>
            {group.difficulty && (
              <DifficultyBadge difficulty={group.difficulty} />
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {new Date(group.createdAt).toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>

          {group.lastStudied && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              <span>
                Học
                {" "}
                {new Date(group.lastStudied).toLocaleDateString("vi-VN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>

        {/* Action button */}
        <GradientButton icon={Zap} onClick={handleView} className="mt-4 w-full">
          Học ngay
        </GradientButton>
      </div>

      {/* Bottom gradient line */}
      <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-gradient-from via-gradient-via to-gradient-to opacity-0 transition-opacity group-hover:opacity-100" />
    </Card>
  );
}
