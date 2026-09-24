import { fileURLToPath, URL } from 'node:url';

import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { ProxyOptions } from 'vite';

// Ekstensi ditulis eksplisit: config loader native Vite menolak impor tanpa ekstensi.
import { DEV_PROXY_API_PREFIX, DEV_PROXY_LOGIN_PREFIX } from './src/helpers/apiProxy.ts';

const parsePort = (value: string | undefined) => {
    const port = Number.parseInt(value ?? '', 10);

    return Number.isNaN(port) ? undefined : port;
};

const parseHosts = (value: string | undefined) =>
    (value ?? '')
        .split(',')
        .map((host) => host.trim())
        .filter((host) => host !== '');

/**
 * Meneruskan satu prefix sintetis ke host upstream sambil memulihkan path aslinya.
 * `/__proxy/api/auth/me` → `https://host/api/lms/auth/me`.
 *
 * Prefix sintetis dipakai, bukan path upstream, supaya dua backend yang kebetulan
 * memakai path sama di host berbeda tidak saling menimpa.
 */
const createProxyEntry = (prefix: string, rawUrl: string): ProxyOptions | null => {
    if (/^https?:\/\//.test(rawUrl) === false) {
        return null;
    }

    const upstream = new URL(rawUrl);
    // Path root menghasilkan '/', yang akan menyisakan garis miring ganda saat disambung.
    const upstreamPath = upstream.pathname.replace(/\/$/, '');

    return {
        target: upstream.origin,
        changeOrigin: true,
        secure: true,
        rewrite: (path) => upstreamPath + path.slice(prefix.length),
    };
};

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), 'VITE_');
    const apiUrl = env.VITE_API_BASE_URL ?? '';
    // Aturan cadangan yang sama dengan `src/helpers/env.ts`.
    const loginUrl = env.VITE_API_LOGIN_URL === '' ? apiUrl : (env.VITE_API_LOGIN_URL ?? apiUrl);
    const isLocal = env.VITE_IS_LOCAL === 'true';
    const allowedHosts = parseHosts(env.VITE_ALLOWED_HOSTS);

    const entries: [string, ProxyOptions | null][] = isLocal
        ? [
              [DEV_PROXY_API_PREFIX, createProxyEntry(DEV_PROXY_API_PREFIX, apiUrl)],
              [DEV_PROXY_LOGIN_PREFIX, createProxyEntry(DEV_PROXY_LOGIN_PREFIX, loginUrl)],
          ]
        : [];

    const proxy = Object.fromEntries(
        entries.filter((entry): entry is [string, ProxyOptions] => entry[1] !== null),
    );

    return {
        plugins: [react(), tailwindcss()],
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
            },
        },
        server: {
            port: parsePort(env.VITE_PORT),
            allowedHosts: allowedHosts.length === 0 ? undefined : allowedHosts,
            /**
             * API dev tidak mengirim header CORS dan menjawab preflight OPTIONS dengan 401,
             * jadi browser akan memblokir pemanggilan langsung. Saat dijalankan di mesin lokal
             * (VITE_IS_LOCAL=true), request dilewatkan server dev Vite — server-ke-server,
             * tidak kena CORS.
             */
            proxy: Object.keys(proxy).length === 0 ? undefined : proxy,
        },
    };
});
