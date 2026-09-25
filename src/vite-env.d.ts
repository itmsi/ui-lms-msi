/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_API_LOGIN_URL?: string;
    readonly VITE_IS_LOCAL?: string;
    readonly VITE_PORT?: string;
    readonly VITE_ALLOWED_HOSTS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
