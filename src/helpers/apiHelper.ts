import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL, API_LOGIN_URL, API_TIMEOUT_MS, API_UPLOAD_TIMEOUT_MS } from '@/helpers/apiConfig';
import { clearStoredSession } from '@/helpers/authSession';
import { getAuthToken } from '@/helpers/authToken';

/**
 * `Content-Type` sengaja TIDAK ditetapkan sebagai default instance.
 *
 * Axios sudah mengisinya sendiri: `application/json` untuk badan berupa objek, dan
 * `multipart/form-data` berikut boundary-nya untuk FormData. Menetapkannya di sini
 * justru merusak unggahan — bila content type JSON sudah terpasang, axios mengubah
 * FormData menjadi objek JSON lewat `formDataToJSON`, yang hanya mampu membawa nilai
 * string. Akibatnya berkas yang dilampirkan lenyap tanpa error apa pun.
 */
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
});

/**
 * Klien terpisah untuk login: base URL-nya bisa menunjuk backend lain, dan sengaja
 * tanpa interceptor token karena saat login belum ada token yang bisa dipasang.
 */
const loginApi = axios.create({
    baseURL: API_LOGIN_URL,
    timeout: API_TIMEOUT_MS,
});

api.interceptors.request.use((config) => {
    const token = getAuthToken();

    if (token !== null) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
});

// Generic API response type
export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    message?: string;
}

// Generic error type
export interface ApiError {
    message: string;
    status?: number;
}

// API Error Response interface
interface ApiErrorResponse {
    message?: string;
    error?: string;
    [key: string]: unknown;
}

/**
 * Kegagalan dilempar sebagai Error sungguhan, bukan objek biasa, supaya
 * `instanceof Error`, stack trace, dan pelaporan error tetap bekerja.
 */
const createApiError = (message: string, status?: number): ApiError & Error => {
    const error = new Error(message) as ApiError & Error;
    error.name = 'ApiError';
    error.status = status;

    return error;
};

/**
 * Endpoint autentikasi menangani 401-nya sendiri: gagal login juga dijawab 401,
 * dan itu bukan sesi kedaluwarsa. Jangan paksa redirect untuk keduanya.
 */
const AUTH_PATHS = ['auth/sso/login'];

const isAuthRequest = (url: string | undefined) => AUTH_PATHS.some((path) => (url ?? '').includes(path));

const handleUnauthorized = () => {
    clearStoredSession();

    // Sesi habis: kembalikan pengguna ke Login, bukan ke root.
    if (window.location.pathname !== '/login') {
        window.location.assign('/login');
    }
};

const toApiError = (error: unknown): ApiError & Error => {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ApiErrorResponse>;
        const status = axiosError.response?.status;

        if (status === 401 && isAuthRequest(axiosError.config?.url) === false) {
            handleUnauthorized();
        }

        if (axiosError.response !== undefined) {
            const body = axiosError.response.data;

            return createApiError(body?.message ?? body?.error ?? axiosError.message, status);
        }

        if (axiosError.request !== undefined) {
            return createApiError('Network error - no response from server');
        }

        return createApiError(axiosError.message);
    }

    return createApiError(error instanceof Error ? error.message : 'An unexpected error occurred');
};

const request = async <T>(run: () => Promise<AxiosResponse<T>>): Promise<ApiResponse<T>> => {
    try {
        const response = await run();

        return {
            data: response.data,
            status: response.status,
        };
    } catch (error) {
        throw toApiError(error);
    }
};

// GET request helper
export const apiGet = async <T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.get<T>(url, { ...config, params }));

/**
 * POST ke backend login. Gagal login dijawab 401, dan itu bukan sesi kedaluwarsa —
 * penanganannya diserahkan ke pemanggil, tidak memicu redirect otomatis.
 */
export const apiLoginPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
): Promise<ApiResponse<T>> => request<T>(() => loginApi.post<T>(url, data));

// POST request helper
export const apiPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.post<T>(url, data, config));

// PUT request helper
export const apiPut = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.put<T>(url, data, config));

// PATCH request helper
export const apiPatch = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.patch<T>(url, data, config));

// DELETE request helper
export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> =>
    request<T>(() => api.delete<T>(url));

/**
 * Content-Type sengaja tidak diisi: browser yang menuliskannya bersama `boundary`
 * multipart. Menyetelnya manual tanpa boundary membuat server gagal mem-parsing body.
 */
export const apiPostMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> =>
    request<T>(() => api.post<T>(url, data, { timeout: API_UPLOAD_TIMEOUT_MS }));

export const apiPutMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> =>
    request<T>(() => api.put<T>(url, data, { timeout: API_UPLOAD_TIMEOUT_MS }));

export default api;
