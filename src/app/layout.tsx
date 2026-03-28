import type { Metadata } from "next";
import { TikTok_Sans } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { ReCaptchaProvider } from "@/provider/ReCaptchaProvider";
import { AuthSyncBootstrap } from "@/components/auth/AuthSyncBootstrap";

const tikTokSans = TikTok_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tiktok-sans",
});

export const metadata: Metadata = {
  title: "KMA Edu - Ôn tập và thi cùng với AI",
  description: "Nền tảng ôn tập và thi trực tuyến hỗ trợ bởi AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <GoogleAnalytics />
      <body className={`${tikTokSans.className}`}>
        <ReCaptchaProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <ToastProvider>
              <AuthSyncBootstrap />
              <div className="min-h-screen [&::-webkit-scrollbar]:w-2">
                {children}
              </div>
            </ToastProvider>
          </ThemeProvider>
        </ReCaptchaProvider>
      </body>
    </html>
  );
}
