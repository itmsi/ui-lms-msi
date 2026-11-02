import { DateRangeFilter } from '@/components/patterns/DateRangeFilter';
import { SearchBar } from '@/components/patterns/SearchBar';
import { FilterChip } from '@/components/ui/FilterChip';
import { strings } from '@/locales/id';
import type { DateRange } from '@/types/dateRange';
import { toIsoDate } from '@/utils/dateTime';
import { presetRange, RANGE_PRESET_OPTIONS } from '@/utils/rangePreset';
import type { RangePreset, RangeSelectionPreset } from '@/utils/rangePreset';

interface FilterSectionProps {
    searchValue: string;
    moduleId: string | null;
    moduleTitle: string | null;
    rangePreset: RangeSelectionPreset;
    dateRange: DateRange;
    now: number;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectModule: (moduleId: string | null) => void;
    onSelectPreset: (preset: RangePreset) => void;
    onChangeRange: (range: DateRange) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    moduleId,
    moduleTitle,
    rangePreset,
    dateRange,
    now,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectModule,
    onSelectPreset,
    onChangeRange,
    onClearFilters,
}: FilterSectionProps) => (
    <div className="flex flex-col gap-3">
        <div className="flex flex-col items-start gap-4 md:flex-row md:items-center">
            <div className="w-full flex-1">
                <SearchBar
                    label={strings.activityLog.searchLabel}
                    placeholder={strings.activityLog.searchPlaceholder}
                    value={searchValue}
                    onSubmit={onSearchSubmit}
                    hasFilters={hasFilters}
                    onClear={onClearFilters}
                    disabled={disabled}
                />
            </div>
            <div className="bg-surface border-line rounded-card hover:border-primary/50 flex min-h-11 items-center gap-2 border p-0 transition-colors md:basis-1/4">
                <DateRangeFilter
                    presets={RANGE_PRESET_OPTIONS}
                    resolvePreset={presetRange}
                    preset={rangePreset}
                    range={dateRange}
                    max={toIsoDate(new Date(now))}
                    onSelectPreset={onSelectPreset}
                    onChangeRange={onChangeRange}
                />
            </div>
        </div>

        {moduleId === null ? null : (
            <div className="flex flex-wrap items-center gap-2">
                <FilterChip
                    label={strings.activityLog.filterModuleChip}
                    value={moduleTitle ?? strings.activityLog.thisMaterial}
                    onRemove={() => onSelectModule(null)}
                />
            </div>
        )}
    </div>
);
