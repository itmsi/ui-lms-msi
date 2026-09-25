import { DEV_PROXY_API_PREFIX, DEV_PROXY_LOGIN_PREFIX } from '@/helpers/apiProxy';
import { API_BASE_URL_SOURCE, API_LOGIN_URL_SOURCE, IS_DEV, IS_LOCAL } from '@/helpers/env';

const isAbsoluteUrl = (url: string) => /^https?:\/\//.test(url);

const resolveBaseUrl = (source: string, devPrefix: string): string =>
    IS_DEV && IS_LOCAL && isAbsoluteUrl(source) ? devPrefix : source;

export const API_BASE_URL: string = resolveBaseUrl(API_BASE_URL_SOURCE, DEV_PROXY_API_PREFIX);

export const API_LOGIN_URL: string = resolveBaseUrl(API_LOGIN_URL_SOURCE, DEV_PROXY_LOGIN_PREFIX);

export const API_TIMEOUT_MS = 30_000;

export const API_UPLOAD_TIMEOUT_MS = 120_000;
