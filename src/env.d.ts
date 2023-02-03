interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
  readonly VULPECULA_RECAPTCHA?: "recaptcha" | "turnstile";
  readonly VULPECULA_RECAPTCHA_SITE_KEY?: string;
  readonly VULPECULA_RECAPTCHA_SITE_SECRET?: string;
  readonly MAIL_HOST: string;
  readonly MAIL_PORT: number;
  readonly MAIL_SECURE: boolean;
  readonly MAIL_AUTH_USER: string;
  readonly MAIL_AUTH_PASS: string;
  readonly MAIL_FROM: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
