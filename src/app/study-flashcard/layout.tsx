"use client";

import { useAuthSync } from "@/hooks/useAuthSync";
import { ThemeProvider } from "@/provider/ThemeProvider";

export default function StudyFlashcardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Still sync auth for API calls, but no sidebar/header/footer
  useAuthSync();

  return (
    <ThemeProvider>
      <div className="min-h-screen">{children}</div>
    </ThemeProvider>
  );
}
