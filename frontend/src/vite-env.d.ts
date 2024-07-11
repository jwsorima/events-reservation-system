/// <reference types="vite/client" />
/// <reference types="vite-plugin-svgr/client" />

interface ImportMetaEnv {
  readonly VITE_BE_DOMAIN_NAME: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}