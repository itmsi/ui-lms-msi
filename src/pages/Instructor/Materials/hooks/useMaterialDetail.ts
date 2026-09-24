import { useCallback, useEffect, useState } from 'react';

import { fetchMaterialDetail } from '@/pages/Instructor/Materials/services/materialService';
import type { MaterialDetailOutcome } from '@/pages/Instructor/Materials/services/materialService';
import type { MaterialDetail } from '@/pages/Instructor/Materials/types';

type LoadedState =
    | { status: 'success'; detail: MaterialDetail }
    | { status: 'error'; code: Extract<MaterialDetailOutcome, { ok: false }>['code']; message?: string };

export type MaterialDetailState = { status: 'loading' } | LoadedState;

export const useMaterialDetail = (id: string | undefined) => {
    const [reloadToken, setReloadToken] = useState(0);

    /**
     * Sama seperti daftar: status "loading" diturunkan dari perbandingan kunci, bukan
     * disetel di awal effect — supaya effect hanya menyetel state di dalam callback.
     */
    const queryKey = `${id ?? ''}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    // Tanpa id tidak ada yang bisa diminta; diturunkan langsung, bukan disetel lewat effect.
    const state: MaterialDetailState =
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
            const outcome = await fetchMaterialDetail(id, controller.signal);

            // Permintaan yang dibatalkan bukan kegagalan — jangan tampilkan errornya.
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
