import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ReCaptchaProvider } from "@/provider/ReCaptchaProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ReCaptchaProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <ToastProvider>
          <GoogleAnalytics />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </ReCaptchaProvider>
  );
}
