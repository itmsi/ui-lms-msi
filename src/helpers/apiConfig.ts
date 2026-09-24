import { DEV_PROXY_API_PREFIX, DEV_PROXY_LOGIN_PREFIX } from '@/helpers/apiProxy';
import { API_BASE_URL_SOURCE, API_LOGIN_URL_SOURCE, IS_DEV, IS_LOCAL } from '@/helpers/env';

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url);

/**
 * Di dev, request dikirim ke prefix relatif supaya dilewatkan proxy server Vite
 * (lihat `vite.config.ts`). API dev tidak mengirim header CORS dan preflight-nya
 * dijawab 401, jadi pemanggilan langsung dari browser akan diblokir.
 *
 * Di build produksi, base URL dipakai apa adanya — artinya backend HARUS
 * mengirim header CORS, atau aplikasi disajikan dari origin yang sama.
 */
const resolveBaseUrl = (source: string, devPrefix: string): string =>
    IS_DEV && IS_LOCAL && isAbsoluteUrl(source) ? devPrefix : source;

/** Dipakai seluruh permintaan setelah login. */
export const API_BASE_URL: string = resolveBaseUrl(API_BASE_URL_SOURCE, DEV_PROXY_API_PREFIX);

/** Dipakai hanya oleh endpoint login. */
export const API_LOGIN_URL: string = resolveBaseUrl(API_LOGIN_URL_SOURCE, DEV_PROXY_LOGIN_PREFIX);

export const API_TIMEOUT_MS = 30_000;

/** Upload file besar butuh waktu lebih panjang daripada request biasa. */
export const API_UPLOAD_TIMEOUT_MS = 120_000;
