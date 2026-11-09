import { PageHeader } from '@/components/patterns/PageHeader';
import { WoodPanel } from '@/components/ui/WoodPanel';
import { useEmployeeSelection } from '@/hooks/useEmployeeSelection';
import { useNow } from '@/hooks/useNow';
import { strings } from '@/locales/id';
import { EmployeeSummary } from '@/pages/Activity/UserActivity/components/EmployeeSummary';
import { ExportExcelButton } from '@/pages/Activity/UserActivity/components/ExportExcelButton';
import { FilterSection } from '@/pages/Activity/UserActivity/components/FilterSection';
import { UserActivityTable } from '@/pages/Activity/UserActivity/components/UserActivityTable';
import { useUserActivity } from '@/pages/Activity/UserActivity/hooks/useUserActivity';

const NOW_TICK_MS = 60_000;

export const UserActivity = () => {
    const now = useNow(NOW_TICK_MS);
    const list = useUserActivity(now);
    const directory = useEmployeeSelection(list.employeeId, list.selectEmployee);

    const isLoading = list.state.status === 'loading';

    return (
        <section className="flex flex-col gap-5">
            <PageHeader
                title={strings.nav.userActivity}
                description={strings.activityLog.userSubtitle}
                actions={
                    <ExportExcelButton
                        disabled={isLoading || list.total === 0}
                        query={{ moduleId: list.moduleId, employeeId: list.employeeId, dateRange: list.dateRange }}
                    />
                }
            />

            <FilterSection
                searchValue={list.search}
                employeeId={list.employeeId}
                selectedEmployee={directory.selectedEmployee}
                employeeFallbackName={list.employeeFallbackName}
                moduleId={list.moduleId}
                moduleTitle={list.moduleTitle}
                rangePreset={list.rangePreset}
                dateRange={list.dateRange}
                now={now}
                hasFilters={list.hasFilters}
                disabled={isLoading}
                onSearchSubmit={list.submitSearch}
                onSelectEmployee={directory.selectEmployee}
                onEmployeesLoaded={directory.rememberEmployees}
                onSelectModule={list.selectModule}
                onSelectPreset={list.selectPreset}
                onChangeRange={list.selectCustomRange}
                onClearFilters={list.clearFilters}
            />

            <WoodPanel className="flex flex-col gap-3">
                {list.employeeId === null ? null : (
                    <EmployeeSummary
                        employeeId={list.employeeId}
                        employee={directory.selectedEmployee}
                        fallbackName={list.employeeFallbackName}
                        total={list.total}
                        totalIsFiltered
                        lastActiveAt={list.lastActiveAt}
                        now={now}
                    />
                )}

                <UserActivityTable
                    state={list.state}
                    lastPagination={list.lastPagination}
                    page={list.page}
                    pageSize={list.pageSize}
                    now={now}
                    employeeId={list.employeeId}
                    employees={directory.employees}
                    hasFilters={list.hasFilters}
                    onChangePage={list.goToPage}
                    onChangeRowsPerPage={list.selectPageSize}
                    onSelectEmployee={list.selectEmployee}
                    onClearFilters={list.clearFilters}
                    onWidenRange={() => list.selectPreset('30d')}
                    onRetry={list.retry}
                />
            </WoodPanel>
        </section>
    );
};

export default UserActivity;
