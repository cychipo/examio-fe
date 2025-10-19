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
        "mx-auto flex w-full min-h-screen flex-1 overflow-x-hidden overflow-y-auto rounded-md md:flex-row flex-col"
      )}>
      <div className="fixed bg-background h-[calc(100%)] md:w-[288px] w-0 z-[100]">
        <SidebarKit />
      </div>
      <div className="w-full m-0 md:p-1 pb-20  md:ml-[288px]">
        {/* Header */}
        <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80 ">
          <div className="container mx-auto py-4 px-2 w-full">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center md:w-10 md:h-10 h-7 w-7 rounded-lg bg-primary/10 border border-primary/20">
                  <Sparkles className="md:w-5 md:h-5 w-4 h-4 text-primary" />
                </div>
                <div>
                  <h1 className="md:text-xl font-bold text-foreground text-sm">
                    Tạo đề kiểm tra/flashcard
                  </h1>
                  <p className="text-xs text-muted-foreground">
                    Sử dụng AI để tạo
                  </p>
                </div>
              </div>

              <div className="flex items-center md:gap-x-6 gap-x-2">
                <div className="border p-2 rounded-xl md:text-sm text-xs text-nowrap font-semibold cursor-pointer">
                  200 Credits
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
