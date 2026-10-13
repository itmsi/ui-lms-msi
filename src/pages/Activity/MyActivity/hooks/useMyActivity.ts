import { useCallback, useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { fetchActivities } from '@/services/activityService';
import type { ActivityLog } from '@/types/activity';
import type { DateRange } from '@/types/dateRange';
import type { ApiFailureCode, ModulePagination } from '@/types/module';
import { lastDaysRange } from '@/utils/dateTime';

const PAGE_SIZE = 10;

export type RangePreset = '7d' | '30d' | '90d';

export const RANGE_PRESET_DAYS: Record<RangePreset, number> = { '7d': 7, '30d': 30, '90d': 90 };

const DEFAULT_PRESET: RangePreset = '7d';

interface RangeSelection {
    preset: RangePreset | 'custom';
    range: DateRange;
}

const presetSelection = (preset: RangePreset): RangeSelection => ({ preset, range: lastDaysRange(RANGE_PRESET_DAYS[preset]) });

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

export const useMyActivity = () => {
    const { user } = useAuth();
    const employeeId = user?.id ?? null;

    const [search, setSearch] = useState('');
    const [moduleId, setModuleId] = useState<string | null>(null);
    const [selection, setSelection] = useState<RangeSelection>(() => presetSelection(DEFAULT_PRESET));
    const [reloadToken, setReloadToken] = useState(0);
    const [requestedPage, setRequestedPage] = useState(1);
    const [attempt, setAttempt] = useState(0);
    const [accumulated, setAccumulated] = useState<Accumulated | null>(null);
    const [failure, setFailure] = useState<Failure | null>(null);

    const dateRange = selection.range;
    const filterKey = `${employeeId ?? ''}|${search}|${moduleId ?? ''}|${dateRange.start}|${dateRange.end}|${String(reloadToken)}`;
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
                { page: pendingPage, limit: PAGE_SIZE, search, moduleId, employeeId, dateRange },
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
    }, [filterKey, pendingPage, attempt, employeeId, search, moduleId, dateRange]);

    const submitSearch = useCallback((value: string) => {
        setSearch(value.trim());
        setRequestedPage(1);
    }, []);

    const selectModule = useCallback((next: string | null) => {
        setModuleId(next);
        setRequestedPage(1);
    }, []);

    const selectPreset = useCallback((preset: RangePreset) => {
        setSelection(presetSelection(preset));
        setRequestedPage(1);
    }, []);

    const selectCustomRange = useCallback((range: DateRange) => {
        setSelection({ preset: 'custom', range });
        setRequestedPage(1);
    }, []);

    const clearFilters = useCallback(() => {
        setSearch('');
        setModuleId(null);
        setSelection(presetSelection(DEFAULT_PRESET));
        setRequestedPage(1);
    }, []);

    const reload = useCallback(() => {
        setReloadToken((token) => token + 1);
        setRequestedPage(1);
    }, []);

    const loadMore = useCallback(() => {
        setRequestedPage((page) => page + 1);
    }, []);

    const retryMore = useCallback(() => {
        setAttempt((value) => value + 1);
    }, []);

    const hasMore = current !== null && current.page < current.pagination.totalPages;

    return {
        status: current === null ? (activeFailure === null ? 'loading' : 'error') : 'ready',
        items: current?.items ?? [],
        total: current?.pagination.total ?? null,
        failure: activeFailure,
        isLoadingMore: current !== null && pendingPage !== null && activeFailure === null,
        loadMoreFailed: current !== null && activeFailure !== null,
        hasMore,
        search,
        moduleId,
        rangePreset: selection.preset,
        dateRange,
        hasFilters: search !== '' || moduleId !== null || selection.preset !== DEFAULT_PRESET,
        pageSize: PAGE_SIZE,
        submitSearch,
        selectModule,
        selectPreset,
        selectCustomRange,
        clearFilters,
        reload,
        loadMore: hasMore ? loadMore : undefined,
        retryMore,
    } as const;
};
