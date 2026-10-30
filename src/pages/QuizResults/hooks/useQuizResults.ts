import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchQuizResults } from '@/services/quizResultService';
import type { QuizFailureCode } from '@/types/quiz';
import type { QuizResultListResult, QuizResultStatusFilter } from '@/types/quizResult';
import { parsePageParam } from '@/utils/pageParam';

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_PAGE_SIZE = 20;

const parsePageSize = (value: string | null): number => {
    const size = Number.parseInt(value ?? '', 10);

    return ROWS_PER_PAGE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
};

const parseStatus = (value: string | null): QuizResultStatusFilter => (value === 'completed' || value === 'not_completed' ? value : 'all');

type LoadedState = { status: 'success'; result: QuizResultListResult } | { status: 'error'; code: QuizFailureCode; message?: string };

export type QuizResultsState = { status: 'loading' } | LoadedState;

type ParamChanges = Partial<Record<'q' | 'quiz', string | null>> & {
    status?: QuizResultStatusFilter;
    page?: number;
    limit?: number;
};

export const useQuizResults = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parsePageParam(searchParams.get('page'));
    const pageSize = parsePageSize(searchParams.get('limit'));
    const search = searchParams.get('q') ?? '';
    const quizId = searchParams.get('quiz');
    const status = parseStatus(searchParams.get('status'));

    const [reloadToken, setReloadToken] = useState(0);
    const queryKey = `${String(page)}|${String(pageSize)}|${search}|${quizId ?? ''}|${status}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: QuizResultsState = loaded !== null && loaded.key === queryKey ? loaded.value : { status: 'loading' };
    const lastPagination = loaded?.value.status === 'success' ? loaded.value.result.pagination : null;

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchQuizResults({ page, limit: pageSize, search, quizId, status }, controller.signal);

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
    }, [queryKey, page, pageSize, search, quizId, status]);

    const applyParams = useCallback(
        (changes: ParamChanges) => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);

                    for (const key of ['q', 'quiz'] as const) {
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

                    if (changes.status !== undefined) {
                        if (changes.status === 'all') {
                            next.delete('status');
                        } else {
                            next.set('status', changes.status);
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
    const selectQuiz = useCallback((value: string | null) => applyParams({ quiz: value }), [applyParams]);
    const selectStatus = useCallback((value: QuizResultStatusFilter) => applyParams({ status: value }), [applyParams]);
    const clearFilters = useCallback(() => applyParams({ q: null, quiz: null, status: 'all' }), [applyParams]);
    const goToPage = useCallback((next: number) => applyParams({ page: next }), [applyParams]);
    const selectPageSize = useCallback((next: number) => applyParams({ limit: next }), [applyParams]);
    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    return {
        state,
        lastPagination,
        page,
        pageSize,
        search,
        quizId,
        status,
        hasFilters: search !== '' || quizId !== null || status !== 'all',
        submitSearch,
        selectQuiz,
        selectStatus,
        clearFilters,
        goToPage,
        selectPageSize,
        retry,
    };
};
