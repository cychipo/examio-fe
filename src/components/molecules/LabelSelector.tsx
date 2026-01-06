"use client";

import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Loader2, Plus, Tag, Palette } from "lucide-react";
import {
  getQuizSetLabelsApi,
  QuizSetLabel,
} from "@/apis/quizsetApi";
import { cn } from "@/lib/utils";

// Predefined colors for labels
const LABEL_COLORS = [
  "#3B82F6", // blue
  "#10B981", // green
  "#F59E0B", // amber
  "#EF4444", // red
  "#8B5CF6", // violet
  "#EC4899", // pink
  "#06B6D4", // cyan
  "#84CC16", // lime
];

interface LabelSelectorProps {
  quizSetId: string | null;
  selectedLabelId: string | null;
  newLabelName: string;
  newLabelColor: string;
  onLabelIdChange: (labelId: string | null) => void;
  onNewLabelNameChange: (name: string) => void;
  onNewLabelColorChange: (color: string) => void;
  mode: "existing" | "new";
  onModeChange: (mode: "existing" | "new") => void;
}

export function LabelSelector({
  quizSetId,
  selectedLabelId,
  newLabelName,
  newLabelColor,
  onLabelIdChange,
  onNewLabelNameChange,
  onNewLabelColorChange,
  mode,
  onModeChange,
}: LabelSelectorProps) {
  const [labels, setLabels] = useState<QuizSetLabel[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch labels when quizSetId changes
  useEffect(() => {
    if (quizSetId) {
      setLoading(true);
      getQuizSetLabelsApi(quizSetId)
        .then((response) => {
          setLabels(response.labels);
          // Auto-switch mode: prefer "existing" if labels exist, otherwise "new"
          if (response.labels.length > 0) {
            onModeChange("existing");
          } else {
            onModeChange("new");
          }
        })
        .catch((error) => {
          console.error("Failed to fetch labels:", error);
          setLabels([]);
          onModeChange("new");
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLabels([]);
      onModeChange("new");
    }
  }, [quizSetId, onModeChange]);

  if (!quizSetId) {
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Đang tải nhãn...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Label className="flex items-center gap-2">
        <Tag className="h-4 w-4" />
        Nhãn câu hỏi (tùy chọn)
      </Label>

      <RadioGroup
        value={mode}
        onValueChange={(value) => onModeChange(value as "existing" | "new")}
        className="space-y-2"
      >
        {/* Existing labels option - default if labels exist */}
        {labels.length > 0 && (
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="existing" id="label-existing" />
            <Label htmlFor="label-existing" className="cursor-pointer font-normal">
              Chọn nhãn có sẵn
            </Label>
          </div>
        )}

        {/* Create new label option - always available */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="new" id="label-new" />
          <Label htmlFor="label-new" className="cursor-pointer font-normal">
            Tạo nhãn mới
          </Label>
        </div>
      </RadioGroup>

      {/* Existing label selector */}
      {mode === "existing" && labels.length > 0 && (
          <Select
            value={selectedLabelId || ""}
            onValueChange={onLabelIdChange}
          >
          <SelectTrigger>
            <SelectValue placeholder="Chọn nhãn..." />
          </SelectTrigger>
          <SelectContent>
            {labels.map((label) => (
              <SelectItem key={label.id} value={label.id}>
                <div className="flex items-center gap-2">
                  {label.color && (
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: label.color }}
                    />
                  )}
                  <span>{label.name}</span>
                  <span className="text-muted-foreground text-xs">
                    ({label.questionCount || 0} câu)
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* New label form */}
      {mode === "new" && (
        <div className="space-y-3 pl-6 border-l-2 border-primary/20">
          <div>
            <Label htmlFor="new-label-name" className="text-sm">
              Tên nhãn
            </Label>
            <Input
              id="new-label-name"
              placeholder="VD: Chương 1, Phần A, ..."
              value={newLabelName}
              onChange={(e) => onNewLabelNameChange(e.target.value)}
              className="mt-1"
            />
          </div>

          <div>
            <Label className="text-sm flex items-center gap-1">
              <Palette className="h-3 w-3" />
              Màu sắc
            </Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {LABEL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => onNewLabelColorChange(color)}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 transition-all",
                    newLabelColor === color
                      ? "border-foreground scale-110"
                      : "border-transparent hover:scale-105"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
