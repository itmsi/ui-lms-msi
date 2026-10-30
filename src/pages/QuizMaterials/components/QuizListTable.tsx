import { AlertCircle, Trash2 } from 'lucide-react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TableColumn } from 'react-data-table-component';
import { Link, useNavigate } from 'react-router-dom';

import { ClickThroughCell } from '@/components/ui/ClickThroughCell';
import { CustomDataTable } from '@/components/ui/CustomDataTable';
import { EmptyCell } from '@/components/ui/EmptyCell';
import type { EmptyState } from '@/components/ui/EmptyState';
import { IconButton } from '@/components/ui/IconButton';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { strings } from '@/locales/id';
import { QuizScheduleBadge } from '@/pages/QuizMaterials/components/QuizScheduleBadge';
import { QUIZ_LIST_PAGE_SIZES } from '@/pages/QuizMaterials/hooks/useQuizList';
import { quizDetailPath } from '@/pages/QuizMaterials/utils/paths';
import { resolveSchedule } from '@/pages/QuizMaterials/utils/quizSchedule';
import type { QuizListItem } from '@/pages/QuizMaterials/types';
import type { ModulePagination } from '@/types/module';
import { formatIsoRange } from '@/utils/dateRangeText';
import { formatFullDateTime } from '@/utils/dateTime';

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
                {item.createdAt === null ? (
                    <EmptyCell />
                ) : (
                    <time dateTime={item.createdAt} className="text-body text-ink tabular-nums">
                        {formatFullDateTime(item.createdAt)}
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
    items: QuizListItem[];
    today: string;
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
    onDelete: ((item: QuizListItem) => void) | null;
}

export const QuizListTable = ({
    items,
    today,
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
    onDelete,
}: QuizListTableProps) => {
    const navigate = useNavigate();
    const columns = useMemo(() => buildColumns(today, onDelete), [today, onDelete]);

    return (
        <CustomDataTable<QuizListItem>
            ariaLabel={strings.quizMaterials.tableLabel}
            columns={columns}
            data={items}
            keyField="id"
            loading={loading}
            skeletonRows={6}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyIcon={emptyIcon}
            emptyAction={emptyAction}
            onRowClicked={(item) => void navigate(quizDetailPath(item.id))}
            pagination
            paginationServer
            paginationPage={page}
            paginationPerPage={pageSize}
            paginationTotalRows={pagination?.total ?? 0}
            paginationRowsPerPageOptions={QUIZ_LIST_PAGE_SIZES}
            onChangePage={onChangePage}
            onChangeRowsPerPage={(nextPageSize) => onChangeRowsPerPage(nextPageSize)}
        />
    );
};
