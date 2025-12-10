"use client";

import { GoogleReCaptchaProvider as Provider } from "react-google-recaptcha-v3";

interface ReCaptchaProviderProps {
  children: React.ReactNode;
}

export function ReCaptchaProvider({ children }: ReCaptchaProviderProps) {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ?? "";

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
