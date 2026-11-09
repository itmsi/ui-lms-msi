import { ListToolbar } from '@/components/patterns/ListToolbar';
import { SearchBar } from '@/components/patterns/SearchBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { strings } from '@/locales/id';
import type { LibraryCategoryFilter } from '@/pages/Candidate/Library/hooks/useLibrary';
import type { ModuleSort } from '@/types/module';

const CATEGORY_FILTER_OPTIONS: SegmentedOption<LibraryCategoryFilter>[] = [
    { value: 'all', label: strings.library.categoryAll },
    { value: 'reguler', label: strings.library.categoryRegular },
    { value: 'mt', label: strings.library.categoryMt },
    { value: 'onboarding', label: strings.library.categoryOnBoard },
];

interface FilterSectionProps {
    searchValue: string;
    sort: ModuleSort;
    total: number | null;
    canFilterCategory: boolean;
    categoryFilter: LibraryCategoryFilter;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectSort: (sort: ModuleSort) => void;
    onSelectCategoryFilter: (category: LibraryCategoryFilter) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    sort,
    total,
    canFilterCategory,
    categoryFilter,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectSort,
    onSelectCategoryFilter,
    onClearFilters,
}: FilterSectionProps) => (
    <div className="flex flex-col gap-5">
        <SearchBar
            label={strings.library.searchLabel}
            placeholder={strings.library.searchPlaceholder}
            value={searchValue}
            onSubmit={onSearchSubmit}
            hasFilters={hasFilters}
            onClear={onClearFilters}
            disabled={disabled}
        />

        <ListToolbar
            title={searchValue === '' ? strings.library.sectionTitle : strings.library.sectionTitleSearch}
            total={total}
            sort={sort}
            onSelectSort={onSelectSort}
            disabled={disabled}
            filter={
                canFilterCategory ? (
                    <SegmentedControl
                        label={strings.library.categoryLabel}
                        options={CATEGORY_FILTER_OPTIONS}
                        value={categoryFilter}
                        onChange={onSelectCategoryFilter}
                        disabled={disabled}
                    />
                ) : undefined
            }
        />
    </div>
);
