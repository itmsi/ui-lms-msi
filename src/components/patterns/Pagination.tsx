import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { useId } from 'react';

import { Button } from '@/components/ui/Button';
import { strings } from '@/locales/id';
import type { ModulePagination } from '@/types/module';

interface PaginationProps {
    pagination: ModulePagination;
    onChangePage: (page: number) => void;
    disabled: boolean;
    itemLabel?: string;
    pageSize?: number;
    pageSizeOptions?: readonly number[];
    onChangePageSize?: (size: number) => void;
}

export const Pagination = ({
    pagination,
    onChangePage,
    disabled,
    itemLabel,
    pageSize,
    pageSizeOptions,
    onChangePageSize,
}: PaginationProps) => {
    const sizeId = useId();
    const { page, limit, total, totalPages } = pagination;
    const showSummary = itemLabel !== undefined && total > 0;
    const showSizer = pageSize !== undefined && pageSizeOptions !== undefined && onChangePageSize !== undefined;
    const showPager = totalPages > 1;

    if (showSummary === false && showSizer === false && showPager === false) {
        return null;
    }

    const first = (page - 1) * limit + 1;
    const last = Math.min(page * limit, total);

    return (
        <nav
            aria-label={strings.library.pagePrefix}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="text-caption text-muted flex flex-wrap items-center gap-x-5 gap-y-2">
                {showSummary ? (
                    <p aria-live="polite" className="tabular-nums">
                        {strings.library.showing}{' '}
                        <span className="text-ink font-semibold">
                            {first}–{last}
                        </span>{' '}
                        {strings.library.pageSeparator} <span className="text-ink font-semibold">{total}</span> {itemLabel}
                    </p>
                ) : null}

                {showSizer ? (
                    <div className="flex items-center gap-2">
                        <label htmlFor={sizeId}>{strings.library.rowsPerPage}</label>
                        <span className="relative">
                            <select
                                id={sizeId}
                                value={pageSize}
                                disabled={disabled}
                                onChange={(event) => onChangePageSize(Number(event.target.value))}
                                className="border-line bg-surface text-ink hover:border-primary focus-visible:outline-primary h-8 appearance-none rounded-lg border pr-7 pl-2.5 tabular-nums transition-colors focus-visible:outline-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {pageSizeOptions.map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown
                                aria-hidden="true"
                                className="text-muted pointer-events-none absolute inset-y-0 right-2 my-auto size-3.5"
                            />
                        </span>
                    </div>
                ) : null}
            </div>

            {showPager ? (
                <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={disabled || page <= 1}
                        onClick={() => onChangePage(page - 1)}
                        leadingIcon={<ChevronLeft aria-hidden="true" className="size-4" />}
                    >
                        {strings.library.previousPage}
                    </Button>

                    <p aria-live="polite" className="text-caption text-muted tabular-nums">
                        {strings.library.pagePrefix} {page} {strings.library.pageSeparator} {totalPages}
                    </p>

                    <Button
                        variant="secondary"
                        size="sm"
                        disabled={disabled || page >= totalPages}
                        onClick={() => onChangePage(page + 1)}
                        trailingIcon={<ChevronRight aria-hidden="true" className="size-4" />}
                    >
                        {strings.library.nextPage}
                    </Button>
                </div>
            ) : null}
        </nav>
    );
};
