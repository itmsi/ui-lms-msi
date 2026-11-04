import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { useQuizResource } from '@/hooks/useQuizResource';
import { fetchMyQuizzes } from '@/services/quizService';
import { parsePageParam } from '@/utils/pageParam';

const PAGE_SIZE = 10;

type ParamChanges = Partial<Record<'q' | 'module', string | null>> & { page?: number };

export const useMyQuizzes = () => {
    const { user } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();

    const userId = user?.id ?? null;
    const program = user?.program ?? null;
    const page = parsePageParam(searchParams.get('page'));
    const search = searchParams.get('q') ?? '';
    const moduleId = searchParams.get('module');

    const load = useCallback(
        (_key: string, signal: AbortSignal) =>
            fetchMyQuizzes({ page, limit: PAGE_SIZE, search, moduleId, program, userId: userId ?? '' }, signal),
        [moduleId, page, program, search, userId],
    );

    const { state, retry } = useQuizResource(
        userId === null ? undefined : [String(page), search, moduleId ?? '', program ?? '', userId].join('|'),
        load,
    );
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
    const clearFilters = useCallback(() => applyParams({ q: null, module: null }), [applyParams]);
    const goToPage = useCallback((next: number) => applyParams({ page: next }), [applyParams]);

    const received = state.status === 'success' ? state.data.items : [];

    return {
        state,
        retry,
        quizzes: received.filter((quiz) => quiz.questionCount > 0),
        search,
        moduleId,
        moduleTitle: moduleId === null ? null : (received.find((quiz) => quiz.moduleId === moduleId)?.moduleTitle ?? null),
        hasFilters: search !== '' || moduleId !== null,
        submitSearch,
        selectModule,
        clearFilters,
        goToPage,
    };
};
