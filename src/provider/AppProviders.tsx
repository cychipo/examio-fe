import type { PropsWithChildren } from "react";
import { ConfigProvider } from "antd";
import { ThemeProvider } from "@/provider/ThemeProvider";
import { ToastProvider } from "@/components/antd/toast";
import { ReCaptchaProvider } from "@/provider/ReCaptchaProvider";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import { AuthSyncBootstrap } from "@/components/auth/AuthSyncBootstrap";

const antdTheme = {
  token: {
    colorPrimary: "#e31837",
    colorError: "#b71c1c",
    colorWarning: "#ffc107",
    borderRadius: 12,
    fontFamily: "inherit",
  },
  components: {
    Button: {
      borderRadius: 12,
      controlHeight: 40,
    },
    Card: {
      borderRadiusLG: 16,
    },
    Modal: {
      borderRadiusLG: 16,
    },
  },
};

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
        <ConfigProvider theme={antdTheme}>
          <ToastProvider>
            <AuthSyncBootstrap />
            <GoogleAnalytics />
            {children}
          </ToastProvider>
        </ConfigProvider>
      </ThemeProvider>
    </ReCaptchaProvider>
  );
}
