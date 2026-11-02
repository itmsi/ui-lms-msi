import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { ListToolbar } from '@/components/patterns/ListToolbar';
import { SearchBar } from '@/components/patterns/SearchBar';
import { LinkButton } from '@/components/ui/LinkButton';
import { strings } from '@/locales/id';
import { materialCreatePath } from '@/pages/Instructor/Materials/utils/paths';
import type { ModuleSort } from '@/types/module';

interface FilterSectionProps {
    searchValue: string;
    sort: ModuleSort;
    total: number | null;
    hasFilters: boolean;
    disabled: boolean;
    canCreate: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectSort: (sort: ModuleSort) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    sort,
    total,
    hasFilters,
    disabled,
    canCreate,
    onSearchSubmit,
    onSelectSort,
    onClearFilters,
}: FilterSectionProps) => {
    const location = useLocation();

    return (
        <div className="flex flex-col gap-5">
            <SearchBar
                label={strings.materials.searchLabel}
                placeholder={strings.materials.searchPlaceholder}
                value={searchValue}
                onSubmit={onSearchSubmit}
                hasFilters={hasFilters}
                onClear={onClearFilters}
                disabled={disabled}
            />

            <ListToolbar
                title={hasFilters ? strings.materials.sectionTitleSearch : strings.materials.sectionTitle}
                total={total}
                sort={sort}
                onSelectSort={onSelectSort}
                disabled={disabled}
                action={
                    canCreate ? (
                        <LinkButton
                            to={materialCreatePath(location.search)}
                            size="sm"
                            leadingIcon={<Plus aria-hidden="true" className="size-4" />}
                        >
                            {strings.materials.createAction}
                        </LinkButton>
                    ) : undefined
                }
            />
        </div>
    );
};
