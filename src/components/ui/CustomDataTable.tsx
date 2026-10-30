import DataTable from 'react-data-table-component';
import type { ConditionalStyles, Localization, PaginationOptions, TableProps, TableStyles } from 'react-data-table-component';
import type { ReactNode } from 'react';

import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingBlock, Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import { cn } from '@/utils/cn';

type StyleSection = Record<string, object | undefined>;

const BASE_STYLES: TableStyles = {
    headRow: {
        style: {
            minHeight: '44px',
            backgroundColor: 'var(--color-primary-dark)',
            borderBottom: '1px solid var(--color-line)',
        },
    },
    headCells: {
        style: {
            paddingLeft: '16px',
            paddingRight: '16px',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--color-white)',
        },
    },
    rows: {
        style: {
            minHeight: '56px',
            fontSize: '14px',
            color: 'var(--color-ink)',
            borderBottom: '1px solid var(--color-line)',
        },
        highlightOnHoverStyle: {
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-ink)',
            transition: 'background-color 150ms ease',
        },
        stripedStyle: {
            backgroundColor: 'var(--color-background)',
            color: 'var(--color-ink)',
        },
    },
    cells: {
        style: {
            paddingTop: '12px',
            paddingBottom: '12px',
            paddingLeft: '16px',
            paddingRight: '16px',
        },
    },
    pagination: {
        style: {
            minHeight: '52px',
            fontSize: '12px',
            color: 'var(--color-muted)',
            borderTop: '1px solid var(--color-line)',
        },
    },
};

const PAGINATION_OPTIONS: PaginationOptions = {
    rowsPerPageText: strings.dataTable.rowsPerPage,
    rangeSeparatorText: strings.dataTable.rangeSeparator,
    selectAllRowsItemText: strings.dataTable.all,
};

const LOCALIZATION: Localization = {
    pagination: {
        navigationAriaLabel: strings.dataTable.navigation,
        firstPageAriaLabel: strings.dataTable.firstPage,
        previousPageAriaLabel: strings.dataTable.previousPage,
        nextPageAriaLabel: strings.dataTable.nextPage,
        lastPageAriaLabel: strings.dataTable.lastPage,
    },
};

const mergeStyles = (base: TableStyles, override: TableStyles | undefined): TableStyles => {
    if (override === undefined) {
        return base;
    }

    const merged: Record<string, StyleSection> = {};

    for (const source of [base, override]) {
        for (const [section, entries] of Object.entries(source)) {
            const target: StyleSection = merged[section] ?? {};

            for (const [key, style] of Object.entries(entries as StyleSection)) {
                target[key] = { ...target[key], ...style };
            }

            merged[section] = target;
        }
    }

    return merged;
};

const ENTRANCE_ROW_STYLE = { when: () => true, classNames: ['motion-rise'] };

interface TableSkeletonProps {
    rows: number;
}

const TableSkeleton = ({ rows }: TableSkeletonProps) => (
    <LoadingBlock label={strings.common.loading} className="flex w-full flex-col">
        {Array.from({ length: rows }, (_, index) => (
            <div key={index} className="border-line flex items-center gap-4 border-b px-4 py-4 last:border-b-0">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-28 rounded-full" />
                <Skeleton className="size-8 shrink-0 rounded-full" />
                <Skeleton className="h-4 flex-1" />
            </div>
        ))}
    </LoadingBlock>
);

export type CustomDataTableProps<T> = Omit<TableProps<T>, 'progressPending' | 'progressComponent' | 'noDataComponent'> & {
    loading?: boolean;
    skeletonRows?: number;
    emptyTitle?: string;
    emptyDescription?: string;
    emptyIcon?: Parameters<typeof EmptyState>[0]['icon'];
    emptyAction?: ReactNode;
    animateEntrance?: boolean;
    wrapperClassName?: string;
};

export const CustomDataTable = <T,>({
    loading = false,
    skeletonRows = 6,
    emptyTitle = strings.states.emptyTitle,
    emptyDescription,
    emptyIcon,
    emptyAction,
    animateEntrance = true,
    wrapperClassName,
    customStyles,
    conditionalRowStyles,
    paginationComponentOptions,
    localization,
    onRowClicked,
    ...tableProps
}: CustomDataTableProps<T>) => {
    const rowStyles: ConditionalStyles<T>[] = animateEntrance
        ? [ENTRANCE_ROW_STYLE, ...(conditionalRowStyles ?? [])]
        : (conditionalRowStyles ?? []);

    return (
        <div className={cn('bg-surface border-line rounded-card overflow-hidden border', wrapperClassName)}>
            <DataTable<T>
                highlightOnHover
                persistTableHead
                responsive
                headerSeparator={false}
                columnSeparator={false}
                pointerOnHover={onRowClicked !== undefined}
                {...tableProps}
                paginationComponentOptions={{ ...PAGINATION_OPTIONS, ...paginationComponentOptions }}
                localization={{ ...LOCALIZATION, ...localization }}
                onRowClicked={onRowClicked}
                customStyles={mergeStyles(BASE_STYLES, customStyles)}
                conditionalRowStyles={rowStyles}
                progressPending={loading}
                progressComponent={<TableSkeleton rows={skeletonRows} />}
                noDataComponent={
                    <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} action={emptyAction} />
                }
            />
        </div>
    );
};
