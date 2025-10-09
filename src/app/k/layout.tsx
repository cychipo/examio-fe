import { SidebarKit } from "@/components/organisms/k/SideBar";
import { cn } from "@/lib/utils";
import type { Metadata } from "next";

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
        "mx-auto flex w-full min-h-screen flex-1 overflow-hidden rounded-md flex-row ",
        "h-[60vh] px-1 py-2",
      )}
    >
      <SidebarKit />
      {children}
    </div>
  );
}
