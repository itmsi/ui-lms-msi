import { useCallback, useEffect, useRef, useState } from 'react';

import { fetchEmployees } from '@/services/employeeService';
import type { Employee } from '@/types/employee';
import type { ApiFailureCode, ModulePagination } from '@/types/module';

const PAGE_SIZE = 10;
const DEBOUNCE_MS = 300;

interface Accumulated {
    key: string;
    items: Employee[];
    page: number;
    pagination: ModulePagination;
}

interface Failure {
    key: string;
    page: number;
    attempt: number;
    code: ApiFailureCode;
}

const ignoreLoaded = () => undefined;

export const useEmployeeSearch = (
    term: string,
    enabled: boolean,
    onLoaded: (items: Employee[]) => void = ignoreLoaded,
) => {
    const [debounced, setDebounced] = useState(term.trim());
    const [requested, setRequested] = useState<{ key: string; page: number }>({ key: '', page: 1 });
    const [attempt, setAttempt] = useState(0);
    const [accumulated, setAccumulated] = useState<Accumulated | null>(null);
    const [failure, setFailure] = useState<Failure | null>(null);

    const onLoadedRef = useRef(onLoaded);

    useEffect(() => {
        onLoadedRef.current = onLoaded;
    }, [onLoaded]);

    useEffect(() => {
        const timer = window.setTimeout(() => setDebounced(term.trim()), DEBOUNCE_MS);

        return () => {
            window.clearTimeout(timer);
        };
    }, [term]);

    const key = debounced;
    const current = accumulated !== null && accumulated.key === key ? accumulated : null;
    const loadedPage = current?.page ?? 0;
    const requestedPage = requested.key === key ? requested.page : 1;
    const pendingPage = enabled && loadedPage < requestedPage ? loadedPage + 1 : null;
    const activeFailure =
        failure !== null && failure.key === key && failure.page === pendingPage && failure.attempt === attempt
            ? failure
            : null;

    useEffect(() => {
        if (pendingPage === null) {
            return;
        }

        const controller = new AbortController();

        const run = async () => {
            const outcome = await fetchEmployees({ page: pendingPage, limit: PAGE_SIZE, search: key }, controller.signal);

            if (controller.signal.aborted) {
                return;
            }

            if (outcome.ok === false) {
                setFailure({ key, page: pendingPage, attempt, code: outcome.code });
                return;
            }

            onLoadedRef.current(outcome.data.items);
            setAccumulated((previous) => ({
                key,
                items: [...(previous !== null && previous.key === key ? previous.items : []), ...outcome.data.items],
                page: pendingPage,
                pagination: outcome.data.pagination,
            }));
        };

        void run();

        return () => {
            controller.abort();
        };
    }, [key, pendingPage, attempt]);

    const loadMore = useCallback(() => {
        setRequested({ key, page: loadedPage + 1 });
    }, [key, loadedPage]);

    const retry = useCallback(() => {
        setAttempt((value) => value + 1);
    }, []);

    return {
        items: current?.items ?? [],
        total: current?.pagination.total ?? null,
        isLoading: pendingPage !== null && activeFailure === null,
        failed: activeFailure !== null,
        hasMore: current !== null && current.page < current.pagination.totalPages,
        isSettling: term.trim() !== debounced,
        loadMore,
        retry,
    };
};
