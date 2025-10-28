"use client";

import { use } from "react";
import { ExamRoomDetailTemplate } from "@/templates/ExamRoomDetailTemplate";

export default function ExamRoomDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  const examInfo = {
    title: "Cơ bản về Khoa học Máy tính",
    subtitle: "Thi cuối kỳ - Học kỳ 1 năm 2024",
    duration: 120,
    totalQuestions: 50,
    passingScore: 70,
    attempts: "1/1",
  };

  const progress = {
    answered: 0,
    total: 50,
    marked: 0,
  };

  const timeRemaining = {
    hours: 2,
    minutes: 0,
    seconds: 0,
  };

  const handleStartExam = () => {
    console.log("Starting exam:", id);
  };

  const handleContactProctor = () => {
    console.log("Contact proctor");
  };

  const handleViewGuidelines = () => {
    console.log("View guidelines");
  };

  const handleTechnicalSupport = () => {
    console.log("Technical support");
  };

  return (
    <ExamRoomDetailTemplate
      examInfo={examInfo}
      progress={progress}
      timeRemaining={timeRemaining}
      examStartTime="15 tháng 12, 2024 lúc 2:00 chiều"
      onStartExam={handleStartExam}
      onContactProctor={handleContactProctor}
      onViewGuidelines={handleViewGuidelines}
      onTechnicalSupport={handleTechnicalSupport}
    />
  );
}
