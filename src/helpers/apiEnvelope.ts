import { isRecord } from '@/helpers/authParsers';

export type EnvelopeResult = { ok: true; data: unknown } | { ok: false; message: string | null };

/**
 * API ini membalas kegagalan validasi dengan status HTTP 2xx dan badan
 * `{ status: false, message: [...] }`, sehingga axios tidak melemparkannya sebagai error.
 * Tanpa pemeriksaan badan, kegagalan akan terbaca sebagai sukses berisi data kosong —
 * pengguna melihat "tidak ada data" padahal permintaannya ditolak.
 *
 * `message` bisa berupa string atau array string; keduanya dirangkum jadi satu kalimat.
 */
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
