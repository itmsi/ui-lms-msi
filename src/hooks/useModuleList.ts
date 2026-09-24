import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { fetchModules } from '@/services/moduleService';
import type { ApiFailureCode, ModuleListResult, ModuleSort } from '@/types/module';

type LoadedState =
    | { status: 'success'; result: ModuleListResult }
    | { status: 'error'; code: ApiFailureCode; message?: string };

export type ModuleListState = { status: 'loading' } | LoadedState;

interface UseModuleListOptions {
    /** null menampilkan semua modul; diisi id pengguna untuk membatasi ke miliknya. */
    createdBy: string | null;
    pageSize: number;
}

const parsePage = (value: string | null): number => {
    const page = Number.parseInt(value ?? '', 10);

    return Number.isFinite(page) && page > 0 ? page : 1;
};

/** Nilai `sort` dari URL bisa disunting siapa saja, jadi hanya yang dikenali dipakai. */
const parseSort = (value: string | null): ModuleSort => (value === 'title' ? 'title' : 'latest');

/**
 * Daftar Module dengan pencarian, pengurutan, dan paginasi yang disimpan di URL —
 * sehingga tombol Back berfungsi dan tautannya bisa dibagikan.
 *
 * Dipakai bersama oleh Perpustakaan (semua materi) dan Materi (hanya milik pengguna);
 * satu-satunya perbedaan keduanya adalah `createdBy`.
 */
export const useModuleList = ({ createdBy, pageSize }: UseModuleListOptions) => {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = parsePage(searchParams.get('page'));
    const search = searchParams.get('q') ?? '';
    const sort = parseSort(searchParams.get('sort'));
    const category = searchParams.get('category');

    const [reloadToken, setReloadToken] = useState(0);

    /**
     * Status "loading" diturunkan dari perbandingan kunci, bukan disimpan sebagai state
     * yang disetel di awal effect. Dengan begitu effect hanya menyetel state di dalam
     * callback setelah permintaan selesai — tidak ada render beruntun.
     */
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

            // Permintaan yang dibatalkan bukan kegagalan — jangan tampilkan errornya.
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
                        // 'latest' adalah default, jadi tidak perlu mengotori URL.
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

                    // Filter berubah tanpa halaman disebut berarti kembali ke halaman pertama.
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
            applyParams({ page: next, q: search, sort, category });
        },
        [applyParams, search, sort, category],
    );

    const selectSort = useCallback(
        (next: ModuleSort) => {
            applyParams({ sort: next });
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
        clearFilters,
        goToPage,
        retry,
        hasFilters: search !== '' || category !== null,
        pageSize,
    };
};
