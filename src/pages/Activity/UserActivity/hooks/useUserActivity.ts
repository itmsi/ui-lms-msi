import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchActivities } from '@/services/activityService';
import type { ActivityListResult } from '@/types/activity';
import type { DateRange } from '@/types/dateRange';
import type { ApiFailureCode } from '@/types/module';
import { findModuleTitle } from '@/utils/activityText';
import { toIsoDate } from '@/utils/dateTime';
import { parsePageParam } from '@/utils/pageParam';
import { DEFAULT_RANGE_PRESET, readRangeParams, writeRangeParams } from '@/utils/rangePreset';
import type { RangeChange, RangePreset } from '@/utils/rangePreset';

export const ROWS_PER_PAGE_OPTIONS = [10, 20, 50, 100];

const DEFAULT_PAGE_SIZE = 20;

const parsePageSize = (value: string | null): number => {
    const size = Number.parseInt(value ?? '', 10);

    return ROWS_PER_PAGE_OPTIONS.includes(size) ? size : DEFAULT_PAGE_SIZE;
};

type LoadedState =
    | { status: 'success'; result: ActivityListResult }
    | { status: 'error'; code: ApiFailureCode; message?: string };

export type UserActivityState = { status: 'loading' } | LoadedState;

type ParamChanges = Partial<Record<'q' | 'module' | 'employee', string | null>> & {
    page?: number;
    limit?: number;
    dateRange?: RangeChange;
};

export const useUserActivity = (now: number) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parsePageParam(searchParams.get('page'));
    const pageSize = parsePageSize(searchParams.get('limit'));
    const search = searchParams.get('q') ?? '';
    const moduleId = searchParams.get('module');
    const employeeId = searchParams.get('employee');
    const todayIso = toIsoDate(new Date(now));
    const selection = readRangeParams(searchParams, todayIso);
    const rangeStart = selection.range.start;
    const rangeEnd = selection.range.end;

    const [reloadToken, setReloadToken] = useState(0);

    const queryKey = `${String(page)}|${String(pageSize)}|${search}|${moduleId ?? ''}|${employeeId ?? ''}|${rangeStart}|${rangeEnd}|${String(reloadToken)}`;
    const [loaded, setLoaded] = useState<{ key: string; value: LoadedState } | null>(null);

    const state: UserActivityState = loaded !== null && loaded.key === queryKey ? loaded.value : { status: 'loading' };
    const lastPagination = loaded?.value.status === 'success' ? loaded.value.result.pagination : null;

    useEffect(() => {
        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchActivities(
                { page, limit: pageSize, search, moduleId, employeeId, dateRange: { start: rangeStart, end: rangeEnd } },
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
    }, [queryKey, page, pageSize, search, moduleId, employeeId, rangeStart, rangeEnd]);

    const applyParams = useCallback(
        (changes: ParamChanges) => {
            setSearchParams(
                (current) => {
                    const next = new URLSearchParams(current);

                    for (const key of ['q', 'module', 'employee'] as const) {
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
    const selectEmployee = useCallback((value: string | null) => applyParams({ employee: value }), [applyParams]);
    const selectPreset = useCallback((preset: RangePreset) => applyParams({ dateRange: { preset } }), [applyParams]);
    const selectCustomRange = useCallback(
        (range: DateRange) => applyParams({ dateRange: { preset: 'custom', range } }),
        [applyParams],
    );
    const clearFilters = useCallback(
        () => applyParams({ q: null, module: null, employee: null, dateRange: { preset: DEFAULT_RANGE_PRESET } }),
        [applyParams],
    );
    const goToPage = useCallback(
        (next: number) => applyParams({ page: next, q: search, module: moduleId, employee: employeeId }),
        [applyParams, search, moduleId, employeeId],
    );
    const selectPageSize = useCallback((next: number) => applyParams({ limit: next }), [applyParams]);
    const retry = useCallback(() => setReloadToken((token) => token + 1), []);

    const items = state.status === 'success' ? state.result.items : [];
    const isFirstPage = state.status === 'success' && state.result.pagination.page === 1;
    const isNarrowed = search !== '' || moduleId !== null || rangeEnd !== todayIso;

    return {
        state,
        lastPagination,
        page,
        pageSize,
        selectPageSize,
        search,
        moduleId,
        moduleTitle: moduleId === null ? null : findModuleTitle(items, moduleId),
        employeeId,
        employeeFallbackName: employeeId === null ? null : (items.find((item) => item.createdBy === employeeId)?.createdByName ?? null),
        total: state.status === 'success' ? state.result.pagination.total : null,
        lastActiveAt: isFirstPage && isNarrowed === false ? (items[0]?.createdAt ?? null) : null,
        rangePreset: selection.preset,
        dateRange: selection.range,
        hasFilters: search !== '' || moduleId !== null || employeeId !== null || selection.preset !== DEFAULT_RANGE_PRESET,
        submitSearch,
        selectModule,
        selectEmployee,
        selectPreset,
        selectCustomRange,
        clearFilters,
        goToPage,
        retry,
    };
};
