import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchQuizzes } from '@/pages/QuizMaterials/services/quizMaterialService';
import type { QuizAudienceFilter, QuizListResult } from '@/pages/QuizMaterials/types';
import type { QuizFailureCode } from '@/types/quiz';
import { parsePageParam } from '@/utils/pageParam';

export const QUIZ_LIST_PAGE_SIZES = [10, 20, 50, 100];

const DEFAULT_PAGE_SIZE = 10;

const parsePageSize = (value: string | null): number => {
    const size = Number.parseInt(value ?? '', 10);

    return QUIZ_LIST_PAGE_SIZES.includes(size) ? size : DEFAULT_PAGE_SIZE;
};

const parseAudience = (value: string | null): QuizAudienceFilter => (value === 'reguler' || value === 'mt' ? value : 'all');

type LoadedState = { status: 'success'; result: QuizListResult } | { status: 'error'; code: QuizFailureCode; message?: string };

export type QuizListState = { status: 'loading' } | LoadedState;

type ParamChanges = Partial<Record<'q' | 'module', string | null>> & {
    audience?: QuizAudienceFilter;
    page?: number;
    limit?: number;
};

export const useQuizList = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parsePageParam(searchParams.get('page'));
    const pageSize = parsePageSize(searchParams.get('limit'));
    const search = searchParams.get('q') ?? '';
    const moduleId = searchParams.get('module');
    const audience = parseAudience(searchParams.get('type'));

    const [reloadToken, setReloadToken] = useState(0);
    const queryKey = `${String(page)}|${String(pageSize)}|${search}|${moduleId ?? ''}|${audience}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: QuizListState = loaded !== null && loaded.key === queryKey ? loaded.value : { status: 'loading' };
    const lastPagination = loaded?.value.status === 'success' ? loaded.value.result.pagination : null;

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchQuizzes({ page, limit: pageSize, search, moduleId, audience }, controller.signal);

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
    }, [queryKey, page, pageSize, search, moduleId, audience]);

    const applyParams = useCallback(
        (changes: ParamChanges) => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);

                    for (const key of ['q', 'module'] as const) {
                        const value = changes[key];

                        if (value === undefined) {
                            continue;
                        }

                        if (value === null || value === '') {
                            next.delete(key);
                        } else {
                            next.set(key, value);
                        }
                    }

                    if (changes.audience !== undefined) {
                        if (changes.audience === 'all') {
                            next.delete('type');
                        } else {
                            next.set('type', changes.audience);
                        }
                    }

                    if (changes.limit !== undefined) {
                        if (changes.limit === DEFAULT_PAGE_SIZE) {
                            next.delete('limit');
                        } else {
                            next.set('limit', String(changes.limit));
                        }
                    }

                    const nextPage = changes.page ?? 1;

                    if (nextPage <= 1) {
                        next.delete('page');
                    } else {
                        next.set('page', String(nextPage));
                    }

                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const submitSearch = useCallback((value: string) => applyParams({ q: value.trim() }), [applyParams]);
    const selectModule = useCallback((value: string | null) => applyParams({ module: value }), [applyParams]);
    const selectAudience = useCallback((value: QuizAudienceFilter) => applyParams({ audience: value }), [applyParams]);
    const clearFilters = useCallback(() => applyParams({ q: null, module: null, audience: 'all' }), [applyParams]);
    const goToPage = useCallback((next: number) => applyParams({ page: next }), [applyParams]);
    const selectPageSize = useCallback((next: number) => applyParams({ limit: next }), [applyParams]);
    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    return {
        state,
        lastPagination,
        page,
        pageSize,
        search,
        moduleId,
        audience,
        hasFilters: search !== '' || moduleId !== null || audience !== 'all',
        submitSearch,
        selectModule,
        selectAudience,
        clearFilters,
        goToPage,
        selectPageSize,
        retry,
    };
};
