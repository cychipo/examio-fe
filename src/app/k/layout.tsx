import { SidebarKit } from "@/components/organisms/k/SideBar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Examio - Quản lý",
  description: "Nền tảng ôn tập và thi trực tuyến hỗ trợ bởi AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md flex-row ",
        "h-[60vh]",
      )}
    >
      <div className="fixed bg-background h-[calc(100%)] w-20">
        <SidebarKit />
      </div>
      <div className="w-full ml-20">
        {/* Header */}
        <header
          className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80"
          style={{ width: "100%" }}
        >
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">
                    AI Study Generator
                  </h1>
                  <p className="text-xs text-muted-foreground">Powered by AI</p>
                </div>
              </div>
            </div>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
