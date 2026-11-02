import { AlertCircle, ClipboardList, SearchX, Trash2 } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { ClickThroughCell } from '@/components/ui/ClickThroughCell';
import { CustomDataTable } from '@/components/ui/CustomDataTable';
import { EmptyCell } from '@/components/ui/EmptyCell';
import { IconButton } from '@/components/ui/IconButton';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { QuizCreateButton } from '@/pages/QuizMaterials/components/QuizCreateButton';
import { QuizScheduleBadge } from '@/pages/QuizMaterials/components/QuizScheduleBadge';
import { QUIZ_LIST_PAGE_SIZES } from '@/pages/QuizMaterials/hooks/useQuizList';
import type { QuizListState } from '@/pages/QuizMaterials/hooks/useQuizList';
import { quizDetailPath } from '@/pages/QuizMaterials/utils/paths';
import { resolveSchedule } from '@/pages/QuizMaterials/utils/quizSchedule';
import type { QuizListItem } from '@/pages/QuizMaterials/types';
import type { ModulePagination } from '@/types/module';
import { formatIsoRange } from '@/utils/dateRangeText';
import { formatFullDateTime, toIsoDate } from '@/utils/dateTime';

const NOW_TICK_MS = 60_000;

const AudienceCell = ({ item }: { item: QuizListItem }) =>
    item.audiences.length === 0 ? (
        <EmptyCell />
    ) : (
        <div className="flex flex-wrap gap-1">
            {item.audiences.map((audience) => (
                <ModuleCategoryBadge key={audience} category={audience} srLabel={strings.quizForm.audienceLabel} />
            ))}
        </div>
    );

const PeriodCell = ({ item, today }: { item: QuizListItem; today: string }) =>
    item.period === null ? (
        <EmptyCell />
    ) : (
        <div className="flex flex-col items-start gap-1 py-1">
            <span className="text-body text-ink tabular-nums">{formatIsoRange(item.period)}</span>
            <QuizScheduleBadge schedule={resolveSchedule(item.period, today)} />
        </div>
    );

const QuestionCountCell = ({ item }: { item: QuizListItem }) =>
    item.questionCount === 0 ? (
        <div className="flex flex-col gap-0.5">
            <span className="text-caption text-warning-ink inline-flex items-center gap-1 font-medium">
                <AlertCircle aria-hidden="true" className="size-3.5 shrink-0" />
                {strings.quizMaterials.noQuestions}
            </span>
            <span className="text-caption text-muted">{strings.quizMaterials.noQuestionsHint}</span>
        </div>
    ) : (
        <span className="text-body text-ink tabular-nums">{`${String(item.questionCount)} ${strings.quizMaterials.questionsSuffix}`}</span>
    );

const buildColumns = (today: string, onDelete: ((item: QuizListItem) => void) | null): TableColumn<QuizListItem>[] => [
    {
        id: 'title',
        name: strings.quizMaterials.titleColumn,
        grow: 2,
        minWidth: '280px',
        wrap: true,
        cell: (item) => (
            <ClickThroughCell>
                <div className="flex min-w-0 flex-col gap-0.5 py-1">
                    <Link
                        to={quizDetailPath(item.id)}
                        className="text-body text-ink hover:text-primary focus-visible:outline-primary pointer-events-auto line-clamp-2 w-fit rounded-sm font-medium underline-offset-2 hover:underline focus-visible:outline-2"
                    >
                        {item.title}
                    </Link>
                    {item.moduleTitle === '' ? null : (
                        <span className="text-caption text-muted line-clamp-1">{`${strings.quizMaterials.modulePrefix} ${item.moduleTitle}`}</span>
                    )}
                </div>
            </ClickThroughCell>
        ),
    },
    {
        id: 'audience',
        name: strings.quizMaterials.audienceColumn,
        width: '180px',
        cell: (item) => (
            <ClickThroughCell>
                <AudienceCell item={item} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'period',
        name: strings.quizMaterials.periodColumn,
        minWidth: '220px',
        cell: (item) => (
            <ClickThroughCell>
                <PeriodCell item={item} today={today} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'questions',
        name: strings.quizMaterials.questionsColumn,
        width: '170px',
        cell: (item) => (
            <ClickThroughCell>
                <QuestionCountCell item={item} />
            </ClickThroughCell>
        ),
    },
    {
        id: 'created',
        name: strings.quizMaterials.createdColumn,
        width: '170px',
        cell: (item) => (
            <ClickThroughCell>
                {item.updatedAt === null ? (
                    <EmptyCell />
                ) : (
                    <time dateTime={item.updatedAt} className="text-body text-ink tabular-nums">
                        {formatFullDateTime(item.updatedAt)}
                    </time>
                )}
            </ClickThroughCell>
        ),
    },
    ...(onDelete === null
        ? []
        : [
            {
                id: 'actions',
                name: strings.quizMaterials.actionsColumn,
                width: '80px',
                button: true,
                cell: (item: QuizListItem) => (
                    <IconButton
                        label={`${strings.quizMaterials.deleteAction} ${item.title}`}
                        tone="danger"
                        icon={<Trash2 aria-hidden="true" className="size-4" />}
                        onClick={() => onDelete(item)}
                    />
                ),
            },
        ]),
];

interface QuizListTableProps {
    state: QuizListState;
    lastPagination: ModulePagination | null;
    page: number;
    pageSize: number;
    hasFilters: boolean;
    canCreate: boolean;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (pageSize: number) => void;
    onClearFilters: () => void;
    onRetry: () => void;
    onDelete: ((item: QuizListItem) => void) | null;
}

export const QuizListTable = ({
    state,
    lastPagination,
    page,
    pageSize,
    hasFilters,
    canCreate,
    onChangePage,
    onChangeRowsPerPage,
    onClearFilters,
    onRetry,
    onDelete,
}: QuizListTableProps) => {
    const navigate = useNavigate();
    const today = toIsoDate(new Date(useNow(NOW_TICK_MS)));
    const columns = useMemo(() => buildColumns(today, onDelete), [today, onDelete]);

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
                    unauthorizedTitle={strings.quizMaterials.unauthorizedTitle}
                    onRetry={onRetry}
                />
            </Card>
        );
    }

    const pagination = state.status === 'success' ? state.result.pagination : lastPagination;

    return (
        <CustomDataTable<QuizListItem>
            ariaLabel={strings.quizMaterials.tableLabel}
            columns={columns}
            data={state.status === 'success' ? state.result.items : []}
            keyField="id"
            loading={state.status === 'loading'}
            skeletonRows={6}
            emptyIcon={hasFilters ? SearchX : ClipboardList}
            emptyTitle={hasFilters ? strings.quizMaterials.filteredEmptyTitle : strings.quizMaterials.emptyTitle}
            emptyDescription={hasFilters ? strings.quizMaterials.filteredEmptyBody : strings.quizMaterials.emptyBody}
            emptyAction={
                hasFilters ? (
                    <Button variant="secondary" size="sm" onClick={onClearFilters}>
                        {strings.quizMaterials.clearFilters}
                    </Button>
                ) : canCreate ? (
                    <QuizCreateButton />
                ) : undefined
            }
            onRowClicked={(item) => void navigate(quizDetailPath(item.id))}
            pagination
            paginationServer
            paginationPage={page}
            paginationPerPage={pageSize}
            paginationTotalRows={pagination?.total ?? 0}
            paginationRowsPerPageOptions={QUIZ_LIST_PAGE_SIZES}
            onChangePage={handlePageChange}
            onChangeRowsPerPage={handleRowsPerPageChange}
        />
    );
};
