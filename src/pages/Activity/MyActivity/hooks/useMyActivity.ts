import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useAuth } from '@/hooks/useAuth';
import { fetchActivities } from '@/services/activityService';
import type { ActivityLog } from '@/types/activity';
import type { DateRange } from '@/types/dateRange';
import type { ApiFailureCode, ModulePagination } from '@/types/module';
import { findModuleTitle } from '@/utils/activityText';
import { toIsoDate } from '@/utils/dateTime';
import { DEFAULT_RANGE_PRESET, readRangeParams, writeRangeParams } from '@/utils/rangePreset';
import type { RangeChange, RangePreset } from '@/utils/rangePreset';

const PAGE_SIZE = 10;

type ParamChanges = Partial<Record<'q' | 'module', string | null>> & { dateRange?: RangeChange };

interface Accumulated {
    key: string;
    items: ActivityLog[];
    page: number;
    pagination: ModulePagination;
}

interface Failure {
    key: string;
    page: number;
    attempt: number;
    code: ApiFailureCode;
    message?: string;
}

const mergeUnique = (previous: ActivityLog[], next: ActivityLog[]): ActivityLog[] => {
    const seen = new Set(previous.map((item) => item.id));

    return [...previous, ...next.filter((item) => seen.has(item.id) === false)];
};

export const useMyActivity = (now: number) => {
    const { user } = useAuth();
    const employeeId = user?.id ?? null;
    const [searchParams, setSearchParams] = useSearchParams();

    const search = searchParams.get('q') ?? '';
    const moduleId = searchParams.get('module');
    const selection = readRangeParams(searchParams, toIsoDate(new Date(now)));
    const rangeStart = selection.range.start;
    const rangeEnd = selection.range.end;

    const [reloadToken, setReloadToken] = useState(0);
    const [requested, setRequested] = useState({ key: '', page: 1 });
    const [attempt, setAttempt] = useState(0);
    const [accumulated, setAccumulated] = useState<Accumulated | null>(null);
    const [failure, setFailure] = useState<Failure | null>(null);

    const filterKey = `${employeeId ?? ''}|${search}|${moduleId ?? ''}|${rangeStart}|${rangeEnd}|${String(reloadToken)}`;
    const requestedPage = requested.key === filterKey ? requested.page : 1;
    const current = accumulated !== null && accumulated.key === filterKey ? accumulated : null;
    const loadedPage = current?.page ?? 0;
    const pendingPage = loadedPage < requestedPage ? loadedPage + 1 : null;
    const activeFailure =
        failure !== null && failure.key === filterKey && failure.page === pendingPage && failure.attempt === attempt
            ? failure
            : null;

    useEffect(() => {
        if (employeeId === null || pendingPage === null) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchActivities(
                { page: pendingPage, limit: PAGE_SIZE, search, moduleId, employeeId, dateRange: { start: rangeStart, end: rangeEnd } },
                controller.signal,
            );

            if (controller.signal.aborted) {
                return;
            }

            if (outcome.ok === false) {
                setFailure({ key: filterKey, page: pendingPage, attempt, code: outcome.code, message: outcome.message });
                return;
            }

            setAccumulated((previous) => ({
                key: filterKey,
                items: mergeUnique(previous !== null && previous.key === filterKey ? previous.items : [], outcome.data.items),
                page: pendingPage,
                pagination: outcome.data.pagination,
            }));
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [filterKey, pendingPage, attempt, employeeId, search, moduleId, rangeStart, rangeEnd]);

    const applyParams = useCallback(
        (changes: ParamChanges) => {
            setSearchParams(
                (previous) => {
                    const next = new URLSearchParams(previous);

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

                    if (changes.dateRange !== undefined) {
                        writeRangeParams(next, changes.dateRange);
                    }

                    return next;
                },
                { replace: true },
            );
        },
        [setSearchParams],
    );

    const submitSearch = useCallback((value: string) => applyParams({ q: value.trim() }), [applyParams]);
    const selectModule = useCallback((next: string | null) => applyParams({ module: next }), [applyParams]);
    const selectPreset = useCallback((preset: RangePreset) => applyParams({ dateRange: { preset } }), [applyParams]);
    const selectCustomRange = useCallback((range: DateRange) => applyParams({ dateRange: { preset: 'custom', range } }), [applyParams]);
    const clearFilters = useCallback(
        () => applyParams({ q: null, module: null, dateRange: { preset: DEFAULT_RANGE_PRESET } }),
        [applyParams],
    );

    const reload = useCallback(() => {
        setReloadToken((token) => token + 1);
    }, []);

    const loadMore = useCallback(() => {
        setRequested({ key: filterKey, page: requestedPage + 1 });
    }, [filterKey, requestedPage]);

    const retryMore = useCallback(() => {
        setAttempt((value) => value + 1);
    }, []);

    const items = current?.items ?? [];

    return {
        status: current === null ? (activeFailure === null ? 'loading' : 'error') : 'ready',
        items,
        total: current?.pagination.total ?? null,
        failure: activeFailure,
        isLoadingMore: current !== null && pendingPage !== null && activeFailure === null,
        loadMoreFailed: current !== null && activeFailure !== null,
        hasMore: current !== null && current.page < current.pagination.totalPages,
        search,
        moduleId,
        moduleTitle: moduleId === null ? null : findModuleTitle(items, moduleId),
        rangePreset: selection.preset,
        dateRange: selection.range,
        hasFilters: search !== '' || moduleId !== null || selection.preset !== DEFAULT_RANGE_PRESET,
        pageSize: PAGE_SIZE,
        submitSearch,
        selectModule,
        selectPreset,
        selectCustomRange,
        clearFilters,
        reload,
        loadMore,
        retryMore,
    } as const;
};
