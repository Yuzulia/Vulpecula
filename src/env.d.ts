interface ImportMetaEnv {
  readonly DATABASE_URL: string;
  readonly REDIS_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
