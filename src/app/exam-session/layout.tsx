"use client";

import { useAuthSync } from "@/hooks/useAuthSync";

export default function ExamSessionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useAuthSync();

  return <div className="min-h-screen bg-background">{children}</div>;
}
