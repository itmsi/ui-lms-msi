import { useCallback, useEffect, useState } from 'react';

import { fetchModuleDetail } from '@/services/moduleService';
import type { ModuleDetail, ModuleDetailOutcome } from '@/types/module';

type LoadedState =
    | { status: 'success'; detail: ModuleDetail }
    | { status: 'error'; code: Extract<ModuleDetailOutcome, { ok: false }>['code']; message?: string };

export type ModuleDetailState = { status: 'loading' } | LoadedState;

export const useModuleDetail = (id: string | undefined) => {
    const [reloadToken, setReloadToken] = useState(0);

    const queryKey = `${id ?? ''}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: ModuleDetailState =
        id === undefined
            ? { status: 'error', code: 'not_found' }
            : loaded !== null && loaded.key === queryKey
              ? loaded.value
              : { status: 'loading' };

    useEffect(() => {
        if (id === undefined) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchModuleDetail(id, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            setLoaded({
                key: queryKey,
                value: outcome.ok
                    ? { status: 'success', detail: outcome.data }
                    : { status: 'error', code: outcome.code, message: outcome.message },
            });
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [queryKey, id]);

    const retry = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    return { state, retry };
};
