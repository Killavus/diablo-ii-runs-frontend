/// <reference types="vite/client" />

interface ImportMetaEnv
  extends Readonly<Record<string, string | boolean | undefined>> {
  readonly VITE_API_URL: string | boolean | undefined;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
