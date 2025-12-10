import { ExamHeaderSection } from "@/components/organisms/k/ExamHeaderSection";
import { ExamInstructionsSection } from "@/components/organisms/k/ExamInstructionsSection";
import { SystemCheckSection } from "@/components/molecules/SystemCheckSection";
import { CountdownTimer } from "@/components/atoms/k/CountdownTimer";
import { ExamProgressSection } from "@/components/organisms/k/ExamProgressSection";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ExamInfo {
  title: string;
  subtitle: string;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  attempts: string;
}

interface ExamProgress {
  answered: number;
  total: number;
  marked: number;
}

interface TimeRemaining {
  hours: number;
  minutes: number;
  seconds: number;
}

interface ExamRoomDetailTemplateProps {
  examInfo: ExamInfo;
  progress: ExamProgress;
  timeRemaining?: TimeRemaining | null;
  examStartTime: string;
  onStartExam: () => void;
}

export function ExamRoomDetailTemplate({
  examInfo,
  progress,
  timeRemaining,
  examStartTime,
  onStartExam,
}: ExamRoomDetailTemplateProps) {
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content - Left Side (2 columns) */}
          <div className="space-y-6 lg:col-span-2">
            {/* Exam Header */}
            <ExamHeaderSection examInfo={examInfo} />

            {/* Exam Instructions */}
            <ExamInstructionsSection />

            {/* System Check */}
            <SystemCheckSection />

            {/* Terms Agreement */}
            <Card className="p-6">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked === true)
                  }
                />
                <label
                  htmlFor="terms"
                  className="flex-1 cursor-pointer text-sm leading-relaxed text-foreground">
                  Tôi xác nhận đã đọc và hiểu các hướng dẫn thi. Tôi đồng ý tuân
                  thủ tất cả các chính sách học thuật và hiểu rằng mọi hành vi
                  gian lận hoặc hỗ trợ trái phép sẽ dẫn đến việc bị loại ngay
                  lập tức.
                </label>
              </div>
            </Card>

            {/* Exam Start Info & Button */}
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                  <span>Bài thi bắt đầu: {examStartTime}</span>
                </div>
                <Button
                  size="lg"
                  disabled={!agreedToTerms}
                  onClick={onStartExam}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90">
                  Bắt đầu làm bài
                </Button>
              </div>
            </Card>
          </div>

          {/* Sidebar - Right Side (1 column) */}
          <div className="space-y-6 lg:col-span-1">
            {/* Countdown Timer - only show if timeRemaining exists */}
            {timeRemaining && (
              <Card className="p-6">
                <CountdownTimer
                  hours={timeRemaining.hours}
                  minutes={timeRemaining.minutes}
                  seconds={timeRemaining.seconds}
                  label="Thời gian còn lại"
                  description="Bài thi sẽ tự động nộp khi hết thời gian"
                />
              </Card>
            )}

            {/* Exam Progress */}
            <ExamProgressSection progress={progress} />
          </div>
        </div>
      </div>
    </div>
  );
}
