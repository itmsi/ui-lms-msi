const env = import.meta.env as Record<string, unknown>;

const readString = (key: string): string => {
    const value = env[key];

    return typeof value === 'string' ? value : '';
};

export const IS_DEV = env.DEV === true;

export const IS_LOCAL = readString('VITE_IS_LOCAL') === 'true';

export const API_BASE_URL_SOURCE = readString('VITE_API_BASE_URL');

export const API_LOGIN_URL_SOURCE = readString('VITE_API_LOGIN_URL') || API_BASE_URL_SOURCE;
