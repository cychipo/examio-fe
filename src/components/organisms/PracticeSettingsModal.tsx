"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Clock, Infinity as InfinityIcon } from "lucide-react";

interface PracticeSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart: (timeLimitMinutes: number | null) => void;
  onCancel?: () => void;
  quizSetTitle: string;
  questionCount: number;
}

export function PracticeSettingsModal({
  open,
  onOpenChange,
  onStart,
  onCancel,
  quizSetTitle,
  questionCount,
}: PracticeSettingsModalProps) {
  const [timeMode, setTimeMode] = useState<"unlimited" | "limited">(
    "unlimited"
  );
  const [timeLimit, setTimeLimit] = useState(30);

  const handleStart = () => {
    const timeLimitMinutes = timeMode === "limited" ? timeLimit : null;
    onStart(timeLimitMinutes);
    // Don't close here - let parent close after async operation completes
  };

  // Suggested times based on question count
  const suggestedTimes = [
    { label: "Nhanh", value: Math.max(10, Math.round(questionCount * 0.5)) },
    { label: "Tiêu chuẩn", value: Math.max(15, Math.round(questionCount * 1)) },
    { label: "Thoải mái", value: Math.max(30, Math.round(questionCount * 2)) },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Cài đặt thi thử</DialogTitle>
          <DialogDescription>
            Chọn thời gian làm bài cho đề thi &quot;{quizSetTitle}&quot;
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Question count info */}
          <div className="text-sm text-muted-foreground text-center p-3 bg-muted rounded-lg">
            Đề thi có <span className="font-semibold">{questionCount}</span> câu
            hỏi
          </div>

          {/* Time mode selection */}
          <RadioGroup
            value={timeMode}
            onValueChange={(value) =>
              setTimeMode(value as "unlimited" | "limited")
            }
            className="space-y-3">
            {/* Unlimited option */}
            <div
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                timeMode === "unlimited"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setTimeMode("unlimited")}>
              <RadioGroupItem value="unlimited" id="unlimited" />
              <Label htmlFor="unlimited" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <InfinityIcon className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Không giới hạn thời gian</div>
                    <div className="text-sm text-muted-foreground">
                      Làm bài thoải mái, chỉ đếm thời gian
                    </div>
                  </div>
                </div>
              </Label>
            </div>

            {/* Limited option */}
            <div
              className={`flex items-center space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                timeMode === "limited"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
              onClick={() => setTimeMode("limited")}>
              <RadioGroupItem value="limited" id="limited" />
              <Label htmlFor="limited" className="flex-1 cursor-pointer">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Giới hạn thời gian</div>
                    <div className="text-sm text-muted-foreground">
                      Tự động nộp bài khi hết giờ
                    </div>
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>

          {/* Time limit input - only show when limited mode */}
          {timeMode === "limited" && (
            <div className="space-y-3 pl-4 border-l-2 border-primary/20">
              {/* Custom input */}
              <div className="flex items-center gap-3">
                <Label
                  htmlFor="timeLimit"
                  className="text-sm whitespace-nowrap">
                  Thời gian:
                </Label>
                <Input
                  id="timeLimit"
                  type="number"
                  min={1}
                  max={180}
                  value={timeLimit || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setTimeLimit(0);
                    } else {
                      const num = Number.parseInt(val, 10);
                      setTimeLimit(
                        Number.isNaN(num) ? 0 : Math.min(180, Math.max(0, num))
                      );
                    }
                  }}
                  onBlur={() => {
                    // Ensure minimum of 1 when leaving the field
                    if (timeLimit < 1) setTimeLimit(1);
                  }}
                  className="w-20"
                />
                <span className="text-sm text-muted-foreground">phút</span>
              </div>

              {/* Quick select buttons */}
              <div className="flex gap-2 flex-wrap">
                {suggestedTimes.map((time) => (
                  <Button
                    key={time.label}
                    type="button"
                    variant={timeLimit === time.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTimeLimit(time.value)}>
                    {time.label} ({time.value}p)
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              onOpenChange(false);
              onCancel?.();
            }}>
            Hủy
          </Button>
          <Button onClick={handleStart}>Bắt đầu làm bài</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
