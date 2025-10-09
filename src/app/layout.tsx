import type { Metadata } from "next";
import { TikTok_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/theme-provider";
import { ToastProvider } from "@/components/ui/toast";

const tikTokSans = TikTok_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tiktok-sans",
});

export const metadata: Metadata = {
  title: "Examio - Ôn tập và thi cùng với AI",
  description: "Nền tảng ôn tập và thi trực tuyến hỗ trợ bởi AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body className={`${tikTokSans.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="min-h-screen [&::-webkit-scrollbar]:w-2">
              {children}
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
