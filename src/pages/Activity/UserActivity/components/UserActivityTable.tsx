import { ExternalLink, UserRound } from 'lucide-react';
import { useMemo } from 'react';
import type { ReactNode } from 'react';
import type { TableColumn } from 'react-data-table-component';

import { ActivityKindIcon } from '@/components/patterns/ActivityKindIcon';
import { CustomDataTable } from '@/components/ui/CustomDataTable';
import type { EmptyState } from '@/components/ui/EmptyState';
import { strings } from '@/locales/id';
import { ROWS_PER_PAGE_OPTIONS } from '@/pages/Activity/UserActivity/hooks/useUserActivity';
import type { ActivityLog } from '@/types/activity';
import type { Employee } from '@/types/employee';
import type { ModulePagination } from '@/types/module';
import { toActivityDisplay, toActivityKind } from '@/utils/activityText';
import { cn } from '@/utils/cn';
import { formatClock, formatDayLabel, formatFullDateTime } from '@/utils/dateTime';
import { shortId } from '@/utils/shortId';

const TimeCell = ({ item, now }: { item: ActivityLog; now: number }) => (
    <time dateTime={item.createdAt} title={formatFullDateTime(item.createdAt)} className="flex flex-col">
        <span className="text-body text-ink tabular-nums">{formatClock(item.createdAt)}</span>
        <span className="text-body text-muted tabular-nums">{formatDayLabel(item.createdAt, now)}</span>
    </time>
);

interface EmployeeCellProps {
    item: ActivityLog;
    employee: Employee | undefined;
    isActive: boolean;
    onSelect: (id: string) => void;
}

const EmployeeCell = ({ item, employee, isActive, onSelect }: EmployeeCellProps) => {
    if (item.createdBy === null) {
        return <span className="text-caption text-muted">—</span>;
    }

    const createdBy = item.createdBy;
    const name = item.createdByName ?? employee?.name ?? null;
    const label = name ?? shortId(createdBy);

    return (
        <button
            type="button"
            disabled={isActive}
            onClick={() => onSelect(createdBy)}
            title={employee?.title ?? label}
            aria-label={`${strings.activityLog.filterByEmployee}: ${label}`}
            className={cn(
                'text-caption inline-flex max-w-52 items-center gap-1.5 rounded-full border px-2.5 py-1 transition-colors',
                'focus-visible:outline-primary focus-visible:outline-2',
                name === null && 'font-mono',
                isActive
                    ? 'bg-primary border-primary cursor-default text-white'
                    : 'border-line text-ink hover:border-primary hover:bg-primary-light',
            )}
        >
            <UserRound aria-hidden="true" className="size-3.5 shrink-0" />
            <span className="truncate">{label}</span>
        </button>
    );
};

const ActivityCell = ({ item }: { item: ActivityLog }) => {
    const kind = toActivityKind(item);

    return (
        <div className="flex items-start gap-3 py-3">
            <ActivityKindIcon kind={kind} className="size-8" />
            <div className="flex min-w-0 flex-col gap-1">
                {item.moduleTitle === null ? null : (
                    <p className="font-display text-primary line-clamp-2">{item.moduleTitle}</p>
                )}
                <p className="text-body text-ink wrap-break-word">
                    <span className="sr-only">{strings.activityLog.kind[kind]}: </span>
                    {toActivityDisplay(item.activity)}
                </p>
                {item.type === null && item.fileLink === null ? null : (
                    <div className="flex flex-wrap items-center gap-1.5">
                        {item.type === null ? null : (
                            <span className="bg-neutral-soft text-neutral-ink text-caption w-fit rounded-full px-2 py-0.5">
                                {item.type}
                            </span>
                        )}
                        {item.fileLink === null ? null : (
                            <a
                                href={item.fileLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={item.fileLink}
                                className="text-caption text-primary hover:bg-primary-light focus-visible:outline-primary border-primary/40 inline-flex max-w-64 items-center gap-1 rounded-full border px-2 py-0.5 font-medium transition-colors focus-visible:outline-2"
                            >
                                <ExternalLink aria-hidden="true" className="size-3.5 shrink-0" />
                                <span className="truncate">{item.fileName ?? strings.activityLog.openFile}</span>
                            </a>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};


interface UserActivityTableProps {
    items: ActivityLog[];
    loading: boolean;
    pagination: ModulePagination | null;
    page: number;
    pageSize: number;
    onChangePage: (page: number) => void;
    onChangeRowsPerPage: (pageSize: number) => void;
    now: number;
    employeeId: string | null;
    moduleId: string | null;
    employees: Record<string, Employee>;
    onSelectEmployee: (id: string) => void;
    onSelectModule: (id: string) => void;
    emptyTitle: string;
    emptyDescription: string;
    emptyIcon: Parameters<typeof EmptyState>[0]['icon'];
    emptyAction?: ReactNode;
}

export const UserActivityTable = ({
    items,
    loading,
    pagination,
    page,
    pageSize,
    onChangePage,
    onChangeRowsPerPage,
    now,
    employeeId,
    moduleId,
    employees,
    onSelectEmployee,
    onSelectModule,
    emptyTitle,
    emptyDescription,
    emptyIcon,
    emptyAction,
}: UserActivityTableProps) => {
    const columns = useMemo<TableColumn<ActivityLog>[]>(
        () => [
            {
                id: 'time',
                name: strings.activityLog.timeColumn,
                width: '150px',
                cell: (item) => <TimeCell item={item} now={now} />,
            },
            {
                id: 'employee',
                name: strings.activityLog.employeeColumn,
                width: '240px',
                cell: (item) => (
                    <EmployeeCell
                        item={item}
                        employee={item.createdBy === null ? undefined : employees[item.createdBy]}
                        isActive={item.createdBy !== null && item.createdBy === employeeId}
                        onSelect={onSelectEmployee}
                    />
                ),
            },
            {
                id: 'activity',
                name: strings.activityLog.activityColumn,
                grow: 1,
                minWidth: '320px',
                wrap: true,
                cell: (item) => <ActivityCell item={item} />,
            },
            // {
            //     id: 'actions',
            //     name: <span className="sr-only">{strings.activityLog.actionsColumn}</span>,
            //     width: '140px',
            //     right: true,
            //     button: true,
            //     cell: (item) => (
            //         <ActionsCell item={item} canFilterModule={moduleId !== item.moduleId} onSelectModule={onSelectModule} />
            //     ),
            // },
        ],
        [now, employees, employeeId, moduleId, onSelectEmployee, onSelectModule],
    );

    return (
        <CustomDataTable<ActivityLog>
            ariaLabel={strings.nav.userActivity}
            columns={columns}
            data={items}
            fixedHeader={true}
            loading={loading}
            skeletonRows={8}
            emptyTitle={emptyTitle}
            emptyDescription={emptyDescription}
            emptyIcon={emptyIcon}
            emptyAction={emptyAction}
            fixedHeaderScrollHeight="625px"
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
