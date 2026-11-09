import { isRecord } from '@/helpers/authParsers';
import type { ApiFailureCode, ModulePagination } from '@/types/module';

export type EnvelopeResult = { ok: true; data: unknown } | { ok: false; message: string | null };

export const readEnvelope = (body: unknown): EnvelopeResult => {
    if (isRecord(body) === false) {
        return { ok: false, message: null };
    }

    if (body.success === true) {
        return { ok: true, data: body.data };
    }

    const { message } = body;

    if (typeof message === 'string') {
        return { ok: false, message };
    }

    if (Array.isArray(message)) {
        const lines = (message as unknown[]).filter((item): item is string => typeof item === 'string');

        return { ok: false, message: lines.length === 0 ? null : lines.join('. ') };
    }

    return { ok: false, message: null };
};

export const toPagination = (value: unknown, fallback: { page: number; limit: number }): ModulePagination => {
    const source = isRecord(value) ? value : {};
    const readNumber = (candidate: unknown, byDefault: number) =>
        typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : byDefault;

    return {
        page: readNumber(source.page, fallback.page),
        limit: readNumber(source.limit, fallback.limit),
        total: readNumber(source.total, 0),
        totalPages: readNumber(source.totalPages, 0),
    };
};

export const toApiFailureCode = (error: unknown): ApiFailureCode => {
    const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

    if (status === 401 || status === 403) {
        return 'unauthorized';
    }

    return status === null ? 'offline' : 'unknown';
};
