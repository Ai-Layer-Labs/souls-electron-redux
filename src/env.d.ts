/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_VENICE_API_KEY: string
  readonly VITE_VENICE_ENDPOINT: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 