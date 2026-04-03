import { useEffect } from "react";
import { env } from "@/lib/env";

const GoogleAnalytics = () => {
  useEffect(() => {
    if (!env.measurementId || typeof window === "undefined") {
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[data-gtag="external"]',
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${env.measurementId}`;
      script.dataset.gtag = "external";
      document.head.appendChild(script);
    }

    const inlineScriptId = "ga-inline-config";
    let inlineScript = document.getElementById(inlineScriptId) as HTMLScriptElement | null;

    if (!inlineScript) {
      inlineScript = document.createElement("script");
      inlineScript.id = inlineScriptId;
      document.head.appendChild(inlineScript);
    }

    inlineScript.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = window.gtag || gtag;
      gtag('js', new Date());
      gtag('config', '${env.measurementId}', { page_path: window.location.pathname });
    `;
  }, []);

  return null;
};

export default GoogleAnalytics;
