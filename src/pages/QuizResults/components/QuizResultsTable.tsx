import { ListChecks, PencilLine, SearchX, UserRound } from 'lucide-react';
import { useCallback } from 'react';
import type { ConditionalStyles, TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClickThroughCell } from '@/components/ui/ClickThroughCell';
import { CustomDataTable } from '@/components/ui/CustomDataTable';
import { EmptyCell } from '@/components/ui/EmptyCell';
import { strings } from '@/locales/id';
import { QuizResultStatusBadge } from '@/pages/QuizResults/components/QuizResultStatusBadge';
import { ROWS_PER_PAGE_OPTIONS } from '@/pages/QuizResults/hooks/useQuizResults';
import type { QuizResultsState } from '@/pages/QuizResults/hooks/useQuizResults';
import { quizResultDetailPath } from '@/pages/QuizResults/utils/paths';
import type { ModulePagination } from '@/types/module';
import type { QuizResultRow } from '@/types/quizResult';
import { formatFullDateTime } from '@/utils/dateTime';

const ScoreCell = ({ row }: { row: QuizResultRow }) => {
    if (row.score === null) {
        return <EmptyCell />;
    }

    const percentage = row.maxScore === 0 ? 0 : Math.round((row.score / row.maxScore) * 100);

    return (
        <div className="flex flex-col items-start gap-1">
            <p className="tabular-nums">
                <span className="text-body text-ink font-semibold">{row.score}</span>
                <span className="text-caption text-muted">{` / ${String(row.maxScore)} · ${String(percentage)}%`}</span>
            </p>
            {row.isAdjusted ? (
                <Badge tone="primary" size="sm" icon={PencilLine}>
                    {strings.quizResults.adjustedChip}
                </Badge>
            ) : null}
        </div>
    );
};

const UpdatedByCell = ({ row }: { row: QuizResultRow }) => {
    if (row.adjustedByName === null && row.adjustedAt === null) {
        return <EmptyCell />;
    }

    return (
        <div className="flex min-w-0 flex-col gap-0.5">
            {row.adjustedByName === null ? null : <span className="text-body text-ink truncate">{row.adjustedByName}</span>}
            {row.adjustedAt === null ? null : (
                <time dateTime={row.adjustedAt} className="text-caption text-muted tabular-nums">
                    {formatFullDateTime(row.adjustedAt)}
                </time>
            )}
        </div>
    );
};

const EmployeeCell = ({ row }: { row: QuizResultRow }) => (
    <span className="text-body text-ink flex min-w-0 items-center gap-2 font-medium">
        <span aria-hidden="true" className="bg-primary-light text-primary flex size-8 shrink-0 items-center justify-center rounded-full">
            <UserRound className="size-4" />
        </span>
        <Link
            to={quizResultDetailPath(row.quizId)}
            title={row.employeeName}
            className="hover:text-primary focus-visible:outline-primary pointer-events-auto truncate rounded-sm underline-offset-2 hover:underline focus-visible:outline-2"
        >
            {row.employeeName}
            <span className="sr-only">{`, ${strings.quizResults.openAnswerHint} ${row.quizTitle}`}</span>
        </Link>
    </span>
);

const COLUMNS: TableColumn<QuizResultRow>[] = [
    {
        id: 'employee',
        name: strings.quizResults.employeeColumn,
        grow: 1,
        minWidth: '220px',
        cell: (row) => (
            <ClickThroughCell>
                <EmployeeCell row={row} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'quiz',
        name: strings.quizResults.quizColumn,
        grow: 2,
        minWidth: '260px',
        wrap: true,
        cell: (row) => (
            <ClickThroughCell>
                <div className="flex min-w-0 flex-col gap-0.5 py-1">
                    <span className="text-body text-ink line-clamp-2">{row.quizTitle}</span>
                    {row.moduleTitle === '' ? null : <span className="text-caption text-muted line-clamp-1">{row.moduleTitle}</span>}
                </div>
            </ClickThroughCell>
        ),
    },
    {
        id: 'status',
        name: strings.quizResults.statusColumn,
        width: '150px',
        center: true,
        cell: (row) => (
            <ClickThroughCell>
                <QuizResultStatusBadge status={row.status} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'score',
        name: strings.quizResults.scoreColumn,
        width: '160px',
        center: true,
        cell: (row) => (
            <ClickThroughCell>
                <ScoreCell row={row} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'submitted',
        name: strings.quizResults.submittedColumn,
        width: '170px',
        cell: (row) => (
            <ClickThroughCell>
                {row.submittedAt === null ? (
                    <EmptyCell />
                ) : (
                    <time dateTime={row.submittedAt} className="text-body text-ink tabular-nums">
                        {formatFullDateTime(row.submittedAt)}
                    </time>
                )}
            </ClickThroughCell>
        ),
    },
    {
        id: 'updatedBy',
        name: strings.quizResults.updatedByColumn,
        width: '200px',
        cell: (row) => (
            <ClickThroughCell>
                <UpdatedByCell row={row} />
            </ClickThroughCell>
        ),
    },
];

const ROW_STYLES: ConditionalStyles<QuizResultRow>[] = [{ when: (row) => row.quizId === null, style: { cursor: 'default' } }];

interface QuizResultsTableProps {
    state: QuizResultsState;
    lastPagination: ModulePagination | null;
    page: number;
    pageSize: number;
    hasFilters: boolean;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (pageSize: number) => void;
    onClearFilters: () => void;
    onRetry: () => void;
}

export const QuizResultsTable = ({
    state,
    lastPagination,
    page,
    pageSize,
    hasFilters,
    onChangePage,
    onChangeRowsPerPage,
    onClearFilters,
    onRetry,
}: QuizResultsTableProps) => {
    const navigate = useNavigate();

    const handlePageChange = useCallback(
        (next: number) => {
            if (next !== page) {
                onChangePage(next);
            }
        },
        [onChangePage, page],
    );

    const handleRowsPerPageChange = useCallback(
        (next: number) => {
            if (next !== pageSize) {
                onChangeRowsPerPage(next);
            }
        },
        [onChangeRowsPerPage, pageSize],
    );

    if (state.status === 'error') {
        return (
            <Card>
                <ApiErrorState
                    code={state.code === 'not_found' ? 'unknown' : state.code}
                    message={state.message}
                    unauthorizedTitle={strings.quizResults.unauthorizedTitle}
                    onRetry={onRetry}
                />
            </Card>
        );
    }

    const pagination = state.status === 'success' ? state.result.pagination : lastPagination;

    return (
        <CustomDataTable<QuizResultRow>
            ariaLabel={strings.quizResults.tableLabel}
            columns={COLUMNS}
            data={state.status === 'success' ? state.result.items : []}
            keyField="quizId"
            loading={state.status === 'loading'}
            skeletonRows={8}
            emptyIcon={hasFilters ? SearchX : ListChecks}
            emptyTitle={hasFilters ? strings.quizResults.filteredEmptyTitle : strings.quizResults.emptyTitle}
            emptyDescription={hasFilters ? strings.quizResults.filteredEmptyBody : strings.quizResults.emptyBody}
            emptyAction={
                hasFilters ? (
                    <Button variant="secondary" size="sm" onClick={onClearFilters}>
                        {strings.quizResults.clearFilters}
                    </Button>
                ) : undefined
            }
            conditionalRowStyles={ROW_STYLES}
            onRowClicked={(row) => {
                if (row.quizId !== null) {
                    void navigate(quizResultDetailPath(row.quizId));
                }
            }}
            pagination
            paginationServer
            paginationPage={page}
            paginationPerPage={pageSize}
            paginationTotalRows={pagination?.total ?? 0}
            paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
        />
    );
};
