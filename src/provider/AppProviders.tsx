import type { PropsWithChildren } from "react";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ToastProvider } from "@/components/ui/toast";
import { ReCaptchaProvider } from "@/provider/ReCaptchaProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AuthSyncBootstrap } from "@/components/auth/AuthSyncBootstrap";

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
          <AuthSyncBootstrap />
          <GoogleAnalytics />
          {children}
        </ToastProvider>
      </ThemeProvider>
    </ReCaptchaProvider>
  );
}
