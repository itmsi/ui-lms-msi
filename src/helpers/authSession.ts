import { toMenuItems, toSsoUser, toStringList } from '@/helpers/authParsers';
import { clearAuthToken } from '@/helpers/authToken';
import { tryStorage } from '@/helpers/storage';
import type { ApiMenuItem, ApiSsoUser } from '@/types/auth';

const USER_KEY = 'msi-learning.user';
const MENU_KEY = 'msi-learning.menu';
const SYSTEMS_KEY = 'msi-learning.systems';

const LEGACY_KEYS = ['msi-learning.permissions'];

export interface CachedSession {
    user: ApiSsoUser;
    menu: ApiMenuItem[];
    systems: string[];
}

export const writeCachedSession = ({ user, menu, systems }: CachedSession): boolean =>
    tryStorage((storage) => {
        storage.setItem(USER_KEY, JSON.stringify(user));
        storage.setItem(MENU_KEY, JSON.stringify(menu));
        storage.setItem(SYSTEMS_KEY, JSON.stringify(systems));
    });

export const clearCachedSession = (): boolean =>
    tryStorage((storage) => {
        for (const key of [USER_KEY, MENU_KEY, SYSTEMS_KEY, ...LEGACY_KEYS]) {
            storage.removeItem(key);
        }
    });

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
        clearCachedSession();
        return null;
    }
};

export const clearStoredSession = () => {
    clearAuthToken();
    clearCachedSession();
};
