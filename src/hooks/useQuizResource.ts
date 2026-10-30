import { useCallback, useEffect, useState } from 'react';

import type { QuizFailureCode, QuizOutcome } from '@/types/quiz';

export type QuizResourceState<T> =
    { status: 'loading' } | { status: 'success'; data: T } | { status: 'error'; code: QuizFailureCode; message?: string };

type Loader<T> = (key: string, signal: AbortSignal) => Promise<QuizOutcome<T>>;

export const useQuizResource = <T>(key: string | undefined, load: Loader<T>) => {
    const [reloadToken, setReloadToken] = useState(0);
    const [loaded, setLoaded] = useState<{ key: string; value: QuizResourceState<T> } | null>(null);

    const queryKey = `${key ?? ''}|${String(reloadToken)}`;

    const state: QuizResourceState<T> =
        key === undefined
            ? { status: 'error', code: 'not_found' }
            : loaded !== null && loaded.key === queryKey
              ? loaded.value
              : { status: 'loading' };

    useEffect(() => {
        if (key === undefined) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await load(key, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            setLoaded({
                key: queryKey,
                value: outcome.ok
                    ? { status: 'success', data: outcome.data }
                    : { status: 'error', code: outcome.code, message: outcome.message },
            });
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [key, load, queryKey]);

    const retry = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    return { state, retry };
};
