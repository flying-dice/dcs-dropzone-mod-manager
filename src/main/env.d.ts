/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_APTABASE_APP_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
