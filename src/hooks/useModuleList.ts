import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchModules } from '@/services/moduleService';
import type { ApiFailureCode, ModuleListResult, ModuleSort } from '@/types/module';

type LoadedState =
    | { status: 'success'; result: ModuleListResult }
    | { status: 'error'; code: ApiFailureCode; message?: string };

export type ModuleListState = { status: 'loading' } | LoadedState;

interface UseModuleListOptions {
    createdBy: string | null;
    pageSize: number;
    fixedCategory?: string | null;
    categoryOptions?: readonly string[];
}

const parsePage = (value: string | null): number => {
    const page = Number.parseInt(value ?? '', 10);

    return Number.isFinite(page) && page > 0 ? page : 1;
};

const parseSort = (value: string | null): ModuleSort => (value === 'title' ? 'title' : 'latest');

export const useModuleList = ({ createdBy, pageSize, fixedCategory, categoryOptions }: UseModuleListOptions) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parsePage(searchParams.get('page'));
    const search = searchParams.get('q') ?? '';
    const sort = parseSort(searchParams.get('sort'));
    const isCategoryFixed = fixedCategory !== undefined;
    const urlCategory = searchParams.get('category');
    const category = isCategoryFixed
        ? fixedCategory
        : categoryOptions === undefined || (urlCategory !== null && categoryOptions.includes(urlCategory))
          ? urlCategory
          : null;

    const [reloadToken, setReloadToken] = useState(0);

    const queryKey = `${String(page)}|${search}|${sort}|${category ?? ''}|${createdBy ?? ''}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: ModuleListState = loaded !== null && loaded.key === queryKey ? loaded.value : { status: 'loading' };

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchModules(
                { page, limit: pageSize, search, sort, category, createdBy },
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
    }, [queryKey, page, pageSize, search, sort, category, createdBy]);

    const applyParams = useCallback(
        (changes: { page?: number; q?: string; sort?: ModuleSort; category?: string | null }) => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);

                    if (changes.q !== undefined) {
                        if (changes.q === '') {
                            next.delete('q');
                        } else {
                            next.set('q', changes.q);
                        }
                    }

                    if (changes.sort !== undefined) {
                        if (changes.sort === 'latest') {
                            next.delete('sort');
                        } else {
                            next.set('sort', changes.sort);
                        }
                    }

                    if (changes.category !== undefined) {
                        if (changes.category === null) {
                            next.delete('category');
                        } else {
                            next.set('category', changes.category);
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

    const submitSearch = useCallback(
        (value: string) => {
            applyParams({ q: value.trim() });
        },
        [applyParams],
    );

    const clearFilters = useCallback(() => {
        applyParams({ q: '', category: null });
    }, [applyParams]);

    const goToPage = useCallback(
        (next: number) => {
            applyParams({ page: next, q: search, sort, category: isCategoryFixed ? undefined : category });
        },
        [applyParams, search, sort, category, isCategoryFixed],
    );

    const selectSort = useCallback(
        (next: ModuleSort) => {
            applyParams({ sort: next });
        },
        [applyParams],
    );

    const selectCategory = useCallback(
        (next: string | null) => {
            applyParams({ category: next });
        },
        [applyParams],
    );

    const retry = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    return {
        state,
        page,
        search,
        sort,
        category,
        submitSearch,
        selectSort,
        selectCategory,
        clearFilters,
        goToPage,
        retry,
        hasFilters: search !== '' || (isCategoryFixed === false && category !== null),
        pageSize,
    };
};
