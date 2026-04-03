/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_MEASUREMENT_ID?: string;
  readonly VITE_QUIZ_AES_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
