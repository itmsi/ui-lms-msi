import { PencilLine, UserRound } from 'lucide-react';
import type { ReactNode } from 'react';
import type { ConditionalStyles, TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';

import { Badge } from '@/components/ui/Badge';
import { ClickThroughCell } from '@/components/ui/ClickThroughCell';
import { CustomDataTable } from '@/components/ui/CustomDataTable';
import { EmptyCell } from '@/components/ui/EmptyCell';
import type { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';
import { QuizResultStatusBadge } from '@/pages/QuizResults/components/QuizResultStatusBadge';
import { ROWS_PER_PAGE_OPTIONS } from '@/pages/QuizResults/hooks/useQuizResults';
import { quizResultDetailPath } from '@/pages/QuizResults/paths';
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
        {row.attemptId === null ? (
            <span className="truncate">{row.employeeName}</span>
        ) : (
            <Link
                to={quizResultDetailPath(row.attemptId)}
                title={row.employeeName}
                className="hover:text-primary focus-visible:outline-primary pointer-events-auto truncate rounded-sm underline-offset-2 hover:underline focus-visible:outline-2"
            >
                {row.employeeName}
                <span className="sr-only">{`, ${strings.quizResults.openAnswerHint} ${row.quizTitle}`}</span>
            </Link>
        )}
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

const ROW_STYLES: ConditionalStyles<QuizResultRow>[] = [{ when: (row) => row.attemptId === null, style: { cursor: 'default' } }];

interface QuizResultsTableProps {
    items: QuizResultRow[];
    loading: boolean;
    pagination: ModulePagination | null;
    page: number;
    pageSize: number;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (pageSize: number) => void;
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon: Parameters<typeof EmptyState>[0]['icon'];
    emptyAction?: ReactNode;
}

export const QuizResultsTable = ({
    items,
    loading,
    pagination,
    page,
    pageSize,
    onChangePage,
    onChangeRowsPerPage,
    emptyTitle,
    emptyDescription,
    emptyIcon,
    emptyAction,
}: QuizResultsTableProps) => {
    const navigate = useNavigate();

    return (
        <CustomDataTable<QuizResultRow>
            ariaLabel={strings.quizResults.tableLabel}
            columns={COLUMNS}
            data={items}
            keyField="id"
            loading={loading}
            skeletonRows={8}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyIcon={emptyIcon}
            emptyAction={emptyAction}
            conditionalRowStyles={ROW_STYLES}
            onRowClicked={(row) => {
                if (row.attemptId !== null) {
                    void navigate(quizResultDetailPath(row.attemptId));
                }
            }}
            pagination
            paginationServer
            paginationPage={page}
            paginationPerPage={pageSize}
            paginationTotalRows={pagination?.total ?? 0}
            paginationRowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
            onChangePage={onChangePage}
            onChangeRowsPerPage={(nextPageSize) => onChangeRowsPerPage(nextPageSize)}
        />
    );
};
