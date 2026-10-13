import { Activity, Building2, Clock, Mail } from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/LoadingSkeleton';
import { strings } from '@/locales/id';
import type { Employee } from '@/types/employee';
import { formatFullDateTime, formatRelativeTime } from '@/utils/dateTime';
import { getInitials } from '@/utils/getInitials';
import { shortId } from '@/utils/shortId';

interface EmployeeSummaryProps {
    employeeId: string;
    employee: Employee | null;
    fallbackName: string | null;
    total: number | null;
    totalIsFiltered: boolean;
    lastActiveAt: string | null;
    now: number;
}

export const EmployeeSummary = ({
    employeeId,
    employee,
    fallbackName,
    total,
    totalIsFiltered,
    lastActiveAt,
    now,
}: EmployeeSummaryProps) => {
    const name = employee?.name ?? fallbackName ?? shortId(employeeId);
    const organisation = employee === null ? null : [employee.department, employee.company].filter((part) => part !== null).join(' · ');

    return (
        <Card className="motion-rise flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-4">
                <span
                    aria-hidden="true"
                    className="bg-gradiend text-section flex size-14 shrink-0 items-center justify-center rounded-full font-semibold text-white"
                >
                    {getInitials(name)}
                </span>

                <div className="flex min-w-0 flex-col gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-section truncate">{name}</h2>
                        {employee?.group == null ? null : (
                            <span className="border-primary/40 text-primary-dark bg-primary-light text-caption rounded-full border px-2 py-0.5 font-medium">
                                {strings.activityLog.programLabel} {employee.group}
                            </span>
                        )}
                    </div>

                    {employee?.title == null ? null : <p className="text-body text-ink">{employee.title}</p>}

                    <div className="text-caption text-muted flex flex-wrap items-center gap-x-4 gap-y-1">
                        {organisation === null || organisation === '' ? null : (
                            <span className="inline-flex items-center gap-1.5">
                                <Building2 aria-hidden="true" className="size-3.5" />
                                {organisation}
                            </span>
                        )}
                        {employee?.email == null ? null : (
                            <span className="inline-flex min-w-0 items-center gap-1.5">
                                <Mail aria-hidden="true" className="size-3.5 shrink-0" />
                                <span className="truncate">{employee.email}</span>
                            </span>
                        )}
                        {employee === null ? <span>{strings.activityLog.employeeDetailUnavailable}</span> : null}
                    </div>
                </div>
            </div>

            <dl className="grid shrink-0 grid-cols-2 gap-3 md:w-80">
                <div className="bg-background rounded-lg p-3">
                    <dt className="text-caption text-muted flex items-center gap-1.5">
                        <Activity aria-hidden="true" className="size-3.5" />
                        {totalIsFiltered ? strings.activityLog.matchingLabel : strings.activityLog.totalLabel}
                    </dt>
                    <dd className="text-section text-ink tabular-nums">
                        {total === null ? <Skeleton className="mt-1 h-6 w-10" /> : total}
                    </dd>
                </div>
                <div className="bg-background rounded-lg p-3">
                    <dt className="text-caption text-muted flex items-center gap-1.5">
                        <Clock aria-hidden="true" className="size-3.5" />
                        {strings.activityLog.lastActive}
                    </dt>
                    <dd className="text-card text-ink">
                        {lastActiveAt === null ? (
                            <span className="text-muted">—</span>
                        ) : (
                            <time dateTime={lastActiveAt} title={formatFullDateTime(lastActiveAt)}>
                                {formatRelativeTime(lastActiveAt, now)}
                            </time>
                        )}
                    </dd>
                </div>
            </dl>
        </Card>
    );
};
