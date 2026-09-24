/**
 * Satu-satunya tempat token akses disimpan dan dibaca.
 *
 * Catatan keamanan: menyimpan token di localStorage membuatnya terbaca skrip mana pun
 * di halaman. Pilihan yang lebih aman adalah cookie `httpOnly` yang diatur backend.
 * Keputusan ini menunggu kontrak autentikasi dari tim backend.
 */
const TOKEN_KEY = 'msi-learning.token';

export const getAuthToken = (): string | null => {
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        // Penyimpanan bisa diblokir (mode privat). Perlakukan sebagai belum masuk.
        return null;
    }
};

export const setAuthToken = (token: string) => {
    try {
        window.localStorage.setItem(TOKEN_KEY, token);
    } catch {
        // Token hanya bertahan selama tab terbuka bila penyimpanan diblokir.
    }
};

export const clearAuthToken = () => {
    try {
        window.localStorage.removeItem(TOKEN_KEY);
    } catch {
        // Tidak ada yang bisa dibersihkan.
    }
};
