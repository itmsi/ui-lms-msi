import { isRecord } from '@/helpers/authParsers';

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
