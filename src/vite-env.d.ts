/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CAFE_NAME?: string
  readonly VITE_TILL_ID?: string
  readonly VITE_TILL_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
