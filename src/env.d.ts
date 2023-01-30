interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly VULPECULA_RECAPTCHA?: "recaptcha" | "turnstile";
  readonly VULPECULA_RECAPTCHA_SITE_KEY?: string;
  readonly VULPECULA_RECAPTCHA_SITE_SECRET?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
