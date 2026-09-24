/**
 * Prefix khusus server dev. Dipakai bersama oleh klien HTTP dan konfigurasi proxy di
 * `vite.config.ts`, jadi nilainya tinggal di satu berkas — kalau dua sisi ini berbeda,
 * kegagalannya berupa 404 yang membingungkan, bukan error yang menjelaskan dirinya.
 *
 * Prefix sintetis dipakai, bukan path asli upstream, supaya login dan API utama tidak
 * bisa bertabrakan meski keduanya kebetulan memakai path yang sama di host berbeda.
 *
 * Berkas ini sengaja tidak mengimpor apa pun: `vite.config.ts` berjalan di Node dan
 * tidak punya `import.meta.env`.
 */
export const DEV_PROXY_API_PREFIX = '/__proxy/api';

export const DEV_PROXY_LOGIN_PREFIX = '/__proxy/login';
