"use client";

import { use, useEffect } from "react";
import { useExamRoomStore } from "@/stores/useExamRoomStore";
import { ExamRoomDetailTemplate } from "@/templates/ExamRoomDetailTemplate";
import { Skeleton } from "@/components/ui/skeleton";

export default function ExamRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { currentExamRoom, loading, fetchExamRoomById } = useExamRoomStore();

  useEffect(() => {
    if (id) {
      fetchExamRoomById(id);
    }
  }, [id, fetchExamRoomById]);

  // Loading state
  if (loading || !currentExamRoom) {
    return (
      <div className="min-h-screen bg-background">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-60 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-6 lg:col-span-1">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Map dữ liệu từ BE sang format của template
  // Mock data cho các field chưa có từ BE
  const examInfo = {
    title: currentExamRoom.title,
    subtitle: currentExamRoom.description || "Thi trực tuyến",
    duration: 120, // Mock: 2 giờ
    totalQuestions: currentExamRoom.quizSet?.questionCount || 50, // Từ BE hoặc mock
    passingScore: 70, // Mock: điểm đậu 70%
    attempts: currentExamRoom.allowRetake
      ? `0/${currentExamRoom.maxAttempts}` // Mock: chưa thi lần nào
      : "1/1",
  };

  const progress = {
    answered: 0, // Mock: chưa trả lời câu nào
    total: currentExamRoom.quizSet?.questionCount || 50,
    marked: 0, // Mock: chưa đánh dấu câu nào
  };

  const timeRemaining = {
    hours: 2, // Mock: còn 2 giờ
    minutes: 0,
    seconds: 0,
  };

  // Mock: thời gian bắt đầu thi
  const examStartTime = new Date(currentExamRoom.createdAt).toLocaleDateString(
    "vi-VN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  );

  const handleStartExam = () => {
    console.log("Starting exam:", id);
    // TODO: Implement start exam logic
  };

  const handleContactProctor = () => {
    console.log("Contact proctor");
    // TODO: Implement contact proctor logic
  };

  const handleViewGuidelines = () => {
    console.log("View guidelines");
    // TODO: Implement view guidelines logic
  };

  const handleTechnicalSupport = () => {
    console.log("Technical support");
    // TODO: Implement technical support logic
  };

  return (
    <ExamRoomDetailTemplate
      examInfo={examInfo}
      progress={progress}
      timeRemaining={timeRemaining}
      examStartTime={examStartTime}
      onStartExam={handleStartExam}
      onContactProctor={handleContactProctor}
      onViewGuidelines={handleViewGuidelines}
      onTechnicalSupport={handleTechnicalSupport}
    />
  );
}
