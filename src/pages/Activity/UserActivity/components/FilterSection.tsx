import { DateRangeFilter } from '@/components/patterns/DateRangeFilter';
import { EmployeeSelect } from '@/components/patterns/EmployeeSelect';
import { MateriSelect } from '@/components/patterns/MateriSelect';
import { SearchBar } from '@/components/patterns/SearchBar';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import type { Employee } from '@/types/employee';
import { toIsoDate } from '@/utils/dateTime';
import { presetRange } from '@/utils/rangePreset';
import type { RangePreset, RangeSelectionPreset } from '@/utils/rangePreset';

interface FilterSectionProps {
    searchValue: string;
    employeeId: string | null;
    selectedEmployee: Employee | null;
    employeeFallbackName: string | null;
    moduleId: string | null;
    moduleTitle: string | null;
    rangePreset: RangeSelectionPreset;
    dateRange: DateRange;
    now: number;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectEmployee: (employee: Employee | null) => void;
    onEmployeesLoaded: (employees: Employee[]) => void;
    onSelectModule: (moduleId: string | null) => void;
    onSelectPreset: (preset: RangePreset) => void;
    onChangeRange: (range: DateRange) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    employeeId,
    selectedEmployee,
    employeeFallbackName,
    moduleId,
    moduleTitle,
    rangePreset,
    dateRange,
    now,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectEmployee,
    onEmployeesLoaded,
    onSelectModule,
    onSelectPreset,
    onChangeRange,
    onClearFilters,
}: FilterSectionProps) => {
    const { selectedMaterial, rememberMaterials, selectMaterial } = useMaterialSelection(moduleId, onSelectModule);

    return (
        <div className="flex flex-col gap-3">
            <SearchBar
                label={strings.activityLog.searchLabel}
                placeholder={strings.activityLog.searchPlaceholder}
                value={searchValue}
                onSubmit={onSearchSubmit}
                hasFilters={hasFilters}
                onClear={onClearFilters}
                disabled={disabled}
            />
            <div className="grid grid-cols-3 gap-3 lg:flex-row lg:flex-wrap lg:items-start">
                <EmployeeSelect
                    value={employeeId}
                    selected={selectedEmployee}
                    onChange={onSelectEmployee}
                    onEmployeesLoaded={onEmployeesLoaded}
                    fallbackLabel={employeeFallbackName}
                    label={strings.activityLog.employeeFilterLabel}
                    placeholder={strings.activityLog.employeeFilterPlaceholder}
                    className="basis-1/4"
                />
                <MateriSelect
                    value={moduleId}
                    selected={selectedMaterial}
                    onChange={selectMaterial}
                    onMaterialsLoaded={rememberMaterials}
                    fallbackLabel={moduleTitle}
                    label={strings.activityLog.materialFilterLabel}
                    placeholder={strings.activityLog.materialFilterPlaceholder}
                    className="basis-1/4"
                />
                <div className="bg-surface border-line rounded-card hover:border-primary/50 flex min-h-11 basis-1/4 items-center border p-0 transition-colors">
                    <DateRangeFilter
                        resolvePreset={presetRange}
                        preset={rangePreset}
                        range={dateRange}
                        max={toIsoDate(new Date(now))}
                        onSelectPreset={onSelectPreset}
                        onChangeRange={onChangeRange}
                        disabled={disabled}
                    />
                </div>
            </div>
        </div>
    );
};
