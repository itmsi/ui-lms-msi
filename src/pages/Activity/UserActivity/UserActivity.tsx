import { SearchX, Users } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';

import { ApiErrorState } from '@/components/patterns/ApiErrorState';
import { DateRangeFilter } from '@/components/patterns/DateRangeFilter';
import { EmployeeSelect } from '@/components/patterns/EmployeeSelect';
import { MateriSelect } from '@/components/patterns/MateriSelect';
import { PageHeader } from '@/components/patterns/PageHeader';
import { SearchBar } from '@/components/patterns/SearchBar';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { useEmployeeById } from '@/hooks/useEmployeeById';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { EmployeeSummary } from '@/pages/Activity/UserActivity/components/EmployeeSummary';
import { ExportExcelButton } from '@/pages/Activity/UserActivity/components/ExportExcelButton';
import { UserActivityTable } from '@/pages/Activity/UserActivity/components/UserActivityTable';
import { useActivityExport } from '@/pages/Activity/UserActivity/hooks/useActivityExport';
import { useUserActivity } from '@/pages/Activity/UserActivity/hooks/useUserActivity';
import type { Employee } from '@/types/employee';
import { findModuleTitle } from '@/utils/activityText';
import { toIsoDate } from '@/utils/dateTime';
// import { presetRange, RANGE_PRESET_OPTIONS } from '@/utils/rangePreset';
import { presetRange } from '@/utils/rangePreset';

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
        rangePreset,
        dateRange,
        rangeEndsToday,
        hasFilters,
        submitSearch,
        selectModule,
        selectEmployee,
        selectPreset,
        selectCustomRange,
        clearFilters,
        goToPage,
        retry,
    } = useUserActivity(now);

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

    const { selectedMaterial, rememberMaterials, selectMaterial: handleSelectMaterial } = useMaterialSelection(moduleId, selectModule);

    const rangeStart = dateRange.start;
    const rangeEnd = dateRange.end;
    const exportQuery = useMemo(
        () => ({ moduleId, employeeId, dateRange: { start: rangeStart, end: rangeEnd } }),
        [moduleId, employeeId, rangeStart, rangeEnd],
    );
    const exporter = useActivityExport(exportQuery);

    const isLoading = state.status === 'loading';
    const items = state.status === 'success' ? state.result.items : [];
    const total = state.status === 'success' ? state.result.pagination.total : null;
    const isFirstPage = state.status === 'success' && state.result.pagination.page === 1;
    const isNarrowed = search !== '' || moduleId !== null || rangeEndsToday === false;
    const selected = useEmployeeById(employeeId, employeeId === null ? null : (employees[employeeId] ?? null));
    const employeeFallbackName =
        employeeId === null ? null : (items.find((item) => item.createdBy === employeeId)?.createdByName ?? null);

    return (
        <section className="flex flex-col gap-5">
            <PageHeader
                title={strings.nav.userActivity}
                description={strings.activityLog.userSubtitle}
                actions={
                    <ExportExcelButton
                        disabled={isLoading || total === 0}
                        isExporting={exporter.isExporting}
                        file={exporter.file}
                        onExport={() => void exporter.exportFile()}
                        onDismiss={exporter.dismiss}
                    />
                }
            />
            <WoodPanel className="flex flex-col gap-3">

                <div className="basis-1/4 flex-1">
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
                <div className="gap-3 lg:flex-row lg:flex-wrap lg:items-start grid grid-cols-3">
                    <EmployeeSelect
                        value={employeeId}
                        selected={selected}
                        onChange={handleSelectEmployee}
                        onEmployeesLoaded={rememberEmployees}
                        fallbackLabel={employeeFallbackName}
                        label={strings.activityLog.employeeFilterLabel}
                        placeholder={strings.activityLog.employeeFilterPlaceholder}
                        className="basis-1/4"
                    />
                    <MateriSelect
                        value={moduleId}
                        selected={selectedMaterial}
                        onChange={handleSelectMaterial}
                        onMaterialsLoaded={rememberMaterials}
                        fallbackLabel={moduleId === null ? null : findModuleTitle(items, moduleId)}
                        label={strings.activityLog.materialFilterLabel}
                        placeholder={strings.activityLog.materialFilterPlaceholder}
                        className="basis-1/4"
                    />
                    <div className="basis-1/4 bg-surface border-line rounded-card flex min-h-11 items-center border p-0 transition-colors hover:border-primary/50">
                        <DateRangeFilter
                            // presets={RANGE_PRESET_OPTIONS}
                            resolvePreset={presetRange}
                            preset={rangePreset}
                            range={dateRange}
                            max={toIsoDate(new Date(now))}
                            onSelectPreset={selectPreset}
                            onChangeRange={selectCustomRange}
                            disabled={isLoading}
                        />
                    </div>
                </div>
                {employeeId === null ? null : (
                    <EmployeeSummary
                        employeeId={employeeId}
                        employee={selected}
                        fallbackName={employeeFallbackName}
                        total={total}
                        totalIsFiltered
                        lastActiveAt={isFirstPage && isNarrowed === false ? (items[0]?.createdAt ?? null) : null}
                        now={now}
                    />
                )}

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
                        emptyTitle={hasFilters ? strings.activityLog.filteredEmptyTitle : strings.activityLog.userRecentEmptyTitle}
                        emptyDescription={hasFilters ? strings.activityLog.filteredEmptyBody : strings.activityLog.userRecentEmptyBody}
                        emptyAction={
                            hasFilters ? (
                                <Button variant="secondary" size="sm" onClick={clearFilters}>
                                    {strings.library.clearFilters}
                                </Button>
                            ) : (
                                <Button variant="secondary" size="sm" onClick={() => selectPreset('30d')}>
                                    {strings.activityLog.widenRange}
                                </Button>
                            )
                        }
                    />
                )}
            </WoodPanel>
        </section>
    );
};

export default UserActivity;
