/**
 * Satu-satunya tempat variabel environment dibaca.
 *
 * `import.meta.env` bertipe longgar: `vite/client` memberinya index signature
 * `[key: string]: any`, dan tipe yang lebih ketat hanya muncul kalau augment di
 * `vite-env.d.ts` berhasil menyatu. Penggabungan itu bergantung pada urutan
 * pemuatan tipe, jadi bisa berbeda antara editor dan CLI. Daripada mengandalkannya,
 * nilainya dipersempit ke string di sini — sekali, di satu tempat — supaya `any`
 * tidak pernah menyebar ke kode lain.
 */
const env = import.meta.env as Record<string, unknown>;

const readString = (key: string): string => {
    const value = env[key];

    return typeof value === 'string' ? value : '';
};

/** true saat dijalankan lewat `npm run dev`. */
export const IS_DEV = env.DEV === true;

/** 'true' saat aplikasi dijalankan di mesin lokal; mengaktifkan proxy dev. */
export const IS_LOCAL = readString('VITE_IS_LOCAL') === 'true';

/** Base URL API untuk semua permintaan setelah login, termasuk prefix path. */
export const API_BASE_URL_SOURCE = readString('VITE_API_BASE_URL');

/**
 * Base URL khusus endpoint login. Bila kosong, login memakai base URL yang sama
 * dengan API lain — supaya aplikasi tetap berjalan sebelum nilainya diisi.
 * Aturan cadangan yang sama diterapkan di `vite.config.ts`.
 */
export const API_LOGIN_URL_SOURCE = readString('VITE_API_LOGIN_URL') || API_BASE_URL_SOURCE;
