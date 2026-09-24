/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Base URL API untuk semua permintaan setelah login. Contoh: https://host/api/lms */
    readonly VITE_API_BASE_URL: string;
    /** Base URL khusus endpoint login. Bila kosong, memakai VITE_API_BASE_URL. */
    readonly VITE_API_LOGIN_URL?: string;
    /** 'true' saat aplikasi dijalankan di mesin lokal; mengaktifkan proxy dev. */
    readonly VITE_IS_LOCAL?: string;
    readonly VITE_PORT?: string;
    readonly VITE_ALLOWED_HOSTS?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
