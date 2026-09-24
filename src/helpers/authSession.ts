import { toMenuItems, toSsoUser, toStringList } from '@/helpers/authParsers';
import { clearAuthToken } from '@/helpers/authToken';
import type { ApiMenuItem, ApiSsoUser } from '@/types/auth';

/**
 * Salinan `user`, `menu`, dan `system` dari respons login, disimpan apa adanya
 * seperti yang dikirim API supaya mudah diperiksa lewat DevTools.
 *
 * Ini PETUNJUK AWAL agar tampilan langsung terisi saat halaman dimuat ulang — bukan
 * sumber kebenaran. Isinya bisa disunting siapa pun, jadi bentuknya selalu divalidasi
 * saat dibaca, dan otorisasi sesungguhnya tetap ditegakkan backend lewat 401/403.
 */
const USER_KEY = 'msi-learning.user';
const MENU_KEY = 'msi-learning.menu';
const SYSTEMS_KEY = 'msi-learning.systems';

/** Kunci dari kontrak lama; dibersihkan supaya tidak tertinggal sebagai sampah. */
const LEGACY_KEYS = ['msi-learning.permissions'];

export interface CachedSession {
    user: ApiSsoUser;
    menu: ApiMenuItem[];
    systems: string[];
}

export const writeCachedSession = ({ user, menu, systems }: CachedSession) => {
    try {
        window.localStorage.setItem(USER_KEY, JSON.stringify(user));
        window.localStorage.setItem(MENU_KEY, JSON.stringify(menu));
        window.localStorage.setItem(SYSTEMS_KEY, JSON.stringify(systems));
    } catch {
        // Penyimpanan bisa diblokir (mode privat). Aplikasi tetap jalan, hanya tanpa cache.
    }
};

export const clearCachedSession = () => {
    try {
        for (const key of [USER_KEY, MENU_KEY, SYSTEMS_KEY, ...LEGACY_KEYS]) {
            window.localStorage.removeItem(key);
        }
    } catch {
        // Tidak ada yang bisa dibersihkan.
    }
};

const parseStored = (key: string): unknown => {
    const stored = window.localStorage.getItem(key);

    return stored === null ? null : (JSON.parse(stored) as unknown);
};

export const readCachedSession = (): CachedSession | null => {
    try {
        const user = toSsoUser(parseStored(USER_KEY));

        if (user === null) {
            clearCachedSession();
            return null;
        }

        return {
            user,
            menu: toMenuItems(parseStored(MENU_KEY)),
            systems: toStringList(parseStored(SYSTEMS_KEY)),
        };
    } catch {
        // JSON rusak atau penyimpanan diblokir: perlakukan sebagai tidak ada cache.
        clearCachedSession();
        return null;
    }
};

/** Menghapus seluruh jejak sesi: token dan salinan user/menu/system. */
export const clearStoredSession = () => {
    clearAuthToken();
    clearCachedSession();
};
