import { SearchX, Users } from 'lucide-react';
import { useCallback, useState } from 'react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { EmployeeSelect } from '@/components/patterns/EmployeeSelect';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { FilterChip } from '@/components/ui/FilterChip';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { EmployeeSummary } from '@/pages/Activity/UserActivity/components/EmployeeSummary';
import { UserActivityTable } from '@/pages/Activity/UserActivity/components/UserActivityTable';
import { useUserActivity } from '@/pages/Activity/UserActivity/hooks/useUserActivity';
import type { Employee } from '@/types/employee';
import { findModuleTitle } from '@/utils/activityText';

const NOW_TICK_MS = 60_000;

export const UserActivity = () => {
    const now = useNow(NOW_TICK_MS);
    const {
        state,
        lastPagination,
        page,
        pageSize,
        selectPageSize,
        search,
        moduleId,
        employeeId,
        hasFilters,
        submitSearch,
        selectModule,
        selectEmployee,
        clearFilters,
        goToPage,
        retry,
    } = useUserActivity();

    const [employees, setEmployees] = useState<Record<string, Employee>>({});

    const rememberEmployees = useCallback((items: Employee[]) => {
        setEmployees((previous) => {
            const next = { ...previous };

            for (const item of items) {
                next[item.id] = item;
            }

            return next;
        });
    }, []);

    const handleSelectEmployee = useCallback(
        (employee: Employee | null) => {
            if (employee !== null) {
                rememberEmployees([employee]);
            }

            selectEmployee(employee?.id ?? null);
        },
        [rememberEmployees, selectEmployee],
    );

    const isLoading = state.status === 'loading';
    const items = state.status === 'success' ? state.result.items : [];
    const total = state.status === 'success' ? state.result.pagination.total : null;
    const isFirstPage = state.status === 'success' && state.result.pagination.page === 1;
    const isNarrowed = search !== '' || moduleId !== null;
    const selected = employeeId === null ? null : (employees[employeeId] ?? null);

    return (
        <section className="flex flex-col gap-5">
            <PageHeader title={strings.nav.userActivity} description={strings.activityLog.userSubtitle} />

            <WoodPanel className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start">
                    <EmployeeSelect
                        value={employeeId}
                        selected={selected}
                        onChange={handleSelectEmployee}
                        onEmployeesLoaded={rememberEmployees}
                        label={strings.activityLog.employeeFilterLabel}
                        placeholder={strings.activityLog.employeeFilterPlaceholder}
                        className="sm:w-96"
                    />
                    <div className="min-w-0 flex-1">
                        <SearchBar
                            label={strings.activityLog.searchLabel}
                            placeholder={strings.activityLog.searchPlaceholder}
                            value={search}
                            onSubmit={submitSearch}
                            hasFilters={hasFilters}
                            onClear={clearFilters}
                            disabled={isLoading}
                        />
                    </div>
                </div>

                {employeeId === null ? null : (
                    <EmployeeSummary
                        employeeId={employeeId}
                        employee={selected}
                        fallbackName={items.find((item) => item.createdBy === employeeId)?.createdByName ?? null}
                        total={total}
                        totalIsFiltered={isNarrowed}
                        lastActiveAt={isFirstPage && isNarrowed === false ? (items[0]?.createdAt ?? null) : null}
                        now={now}
                    />
                )}

                <div className="flex flex-wrap items-center justify-between gap-2">
                    {/* <p aria-live="polite" className="text-caption text-muted tabular-nums">
                    {total === null ? ' ' : `${String(total)} ${strings.activityLog.totalSuffix}`}
                </p> */}

                    {moduleId === null ? null : (
                        <FilterChip
                            label={strings.activityLog.filterModuleChip}
                            value={findModuleTitle(items, moduleId) ?? strings.activityLog.thisMaterial}
                            onRemove={() => selectModule(null)}
                        />
                    )}
                </div>


                {state.status === 'error' ? (
                    <Card>
                        <ApiErrorState
                            code={state.code}
                            message={state.message}
                            unauthorizedTitle={strings.activityLog.unauthorizedTitle}
                            onRetry={retry}
                        />
                    </Card>
                ) : (
                    <UserActivityTable
                        items={items}
                        loading={isLoading}
                        pagination={state.status === 'success' ? state.result.pagination : lastPagination}
                        page={page}
                        pageSize={pageSize}
                        onChangePage={goToPage}
                        onChangeRowsPerPage={selectPageSize}
                        now={now}
                        employeeId={employeeId}
                        moduleId={moduleId}
                        employees={employees}
                        onSelectEmployee={selectEmployee}
                        onSelectModule={selectModule}
                        emptyIcon={hasFilters ? SearchX : Users}
                        emptyTitle={hasFilters ? strings.activityLog.filteredEmptyTitle : strings.activityLog.userEmptyTitle}
                        emptyDescription={hasFilters ? strings.activityLog.filteredEmptyBody : strings.activityLog.userEmptyBody}
                        emptyAction={
                            hasFilters ? (
                                <Button variant="secondary" size="sm" onClick={clearFilters}>
                                    {strings.library.clearFilters}
                                </Button>
                            ) : undefined
                        }
                    />
                )}
            </WoodPanel>
        </section>
    );
};

export default UserActivity;
