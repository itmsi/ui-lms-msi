import { readEnvelope, toApiFailureCode } from '@/helpers/apiEnvelope';
import { isRecord } from '@/helpers/authParsers';
import type { QuizOutcome } from '@/types/quiz';

export const send = async <T>(run: () => Promise<{ data: unknown }>, parse: (data: unknown) => T | null): Promise<QuizOutcome<T>> => {
    if (navigator.onLine === false) {
        return { ok: false, code: 'offline' };
    }

    try {
        const { data: body } = await run();
        const envelope = readEnvelope(body);

        if (envelope.ok === false) {
            return envelope.message === null
                ? { ok: false, code: 'unknown' }
                : { ok: false, code: 'validation', message: envelope.message };
        }

        const parsed = parse(envelope.data);

        return parsed === null ? { ok: false, code: 'not_found' } : { ok: true, data: parsed };
    } catch (error) {
        const status = isRecord(error) && typeof error.status === 'number' ? error.status : null;

        return status === 404 ? { ok: false, code: 'not_found' } : { ok: false, code: toApiFailureCode(error) };
    }
};
