import { useCallback, useEffect, useState } from 'react';

import { fetchModules } from '@/services/moduleService';
import type { ApiFailureCode, ModuleListResult } from '@/types/module';

type LoadedState =
    | { status: 'success'; result: ModuleListResult }
    | { status: 'error'; code: ApiFailureCode; message?: string };

export type TrackModulesState = { status: 'loading' } | LoadedState;

export const useTrackModules = (category: string, limit: number) => {
    const [reloadToken, setReloadToken] = useState(0);

    const queryKey = `${category}|${String(limit)}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: TrackModulesState = loaded !== null && loaded.key === queryKey ? loaded.value : { status: 'loading' };

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchModules(
                { page: 1, limit, search: '', sort: 'latest', category, createdBy: null },
                controller.signal,
            );

            if (controller.signal.aborted) {
                return;
            }

            setLoaded({
                key: queryKey,
                value: outcome.ok
                    ? { status: 'success', result: outcome.data }
                    : { status: 'error', code: outcome.code, message: outcome.message },
            });
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [queryKey, category, limit]);

    const retry = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    return { state, retry };
};
