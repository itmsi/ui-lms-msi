import axios from 'axios';
import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

import { API_BASE_URL, API_LOGIN_URL, API_TIMEOUT_MS, API_UPLOAD_TIMEOUT_MS } from '@/helpers/apiConfig';
import { clearStoredSession } from '@/helpers/authSession';
import { getAuthToken } from '@/helpers/authToken';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: API_TIMEOUT_MS,
});

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

export interface ApiResponse<T = unknown> {
    data: T;
    status: number;
    message?: string;
}

export interface ApiError {
    message: string;
    status?: number;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
    [key: string]: unknown;
}

const createApiError = (message: string, status?: number): ApiError & Error => {
    const error = new Error(message) as ApiError & Error;
    error.name = 'ApiError';
    error.status = status;

    return error;
};

const AUTH_PATHS = ['auth/sso/login'];

const isAuthRequest = (url: string | undefined) => AUTH_PATHS.some((path) => (url ?? '').includes(path));

const handleUnauthorized = () => {
    clearStoredSession();

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

export const apiGet = async <T = unknown>(
    url: string,
    params?: Record<string, string | number | boolean>,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.get<T>(url, { ...config, params }));

export const apiLoginPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown>,
): Promise<ApiResponse<T>> => request<T>(() => loginApi.post<T>(url, data));

export const apiPost = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.post<T>(url, data, config));

export const apiPut = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.put<T>(url, data, config));

export const apiPatch = async <T = unknown>(
    url: string,
    data?: Record<string, unknown> | FormData,
    config?: AxiosRequestConfig,
): Promise<ApiResponse<T>> => request<T>(() => api.patch<T>(url, data, config));

export const apiDelete = async <T = unknown>(url: string): Promise<ApiResponse<T>> =>
    request<T>(() => api.delete<T>(url));

export const apiPostMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> =>
    request<T>(() => api.post<T>(url, data, { timeout: API_UPLOAD_TIMEOUT_MS }));

export const apiPutMultipart = async <T = unknown>(url: string, data: FormData): Promise<ApiResponse<T>> =>
    request<T>(() => api.put<T>(url, data, { timeout: API_UPLOAD_TIMEOUT_MS }));

export default api;
