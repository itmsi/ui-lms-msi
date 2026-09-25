import { tryStorage } from '@/helpers/storage';

const TOKEN_KEY = 'msi-learning.token';

export const getAuthToken = (): string | null => {
    try {
        return window.localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setAuthToken = (token: string): boolean =>
    tryStorage((storage) => storage.setItem(TOKEN_KEY, token));

export const clearAuthToken = (): boolean => tryStorage((storage) => storage.removeItem(TOKEN_KEY));
