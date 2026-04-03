"use client";

import { GoogleReCaptchaProvider as Provider } from "react-google-recaptcha-v3";
import { env } from "@/lib/env";

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = env.recaptchaSiteKey;

  if (!siteKey) {
    // If no site key, render children without the provider
    return <>{children}</>;
  }

  return (
    <Provider
      reCaptchaKey={siteKey}
      scriptProps={{
        async: true,
        defer: true,
        appendTo: "head",
      }}>
      {children}
    </Provider>
  );
}
