const trimTrailingSlash = (value: string) => value.replace(/\/$/, "");

const readEnv = (key: string): string | undefined => {
  const viteValue = import.meta.env[key as keyof ImportMetaEnv];
  if (typeof viteValue === "string" && viteValue.length > 0) {
    return viteValue;
  }

  if (typeof process !== "undefined") {
    const processValue = process.env[key];
    if (typeof processValue === "string" && processValue.length > 0) {
      return processValue;
    }
  }

  return undefined;
};

export const env = {
  apiUrl: trimTrailingSlash(readEnv("VITE_API_URL") ?? readEnv("NEXT_PUBLIC_API_URL") ?? ""),
  recaptchaSiteKey: readEnv("VITE_RECAPTCHA_SITE_KEY") ?? readEnv("NEXT_PUBLIC_RECAPTCHA_SITE_KEY") ?? "",
  measurementId: readEnv("VITE_MEASUREMENT_ID") ?? readEnv("NEXT_PUBLIC_MEASUREMENT_ID") ?? "",
  quizAesKey: readEnv("VITE_QUIZ_AES_KEY") ?? readEnv("NEXT_PUBLIC_QUIZ_AES_KEY") ?? "default-aes-256-key-32-chars!!!",
};
