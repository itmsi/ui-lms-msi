import { MateriSelect } from '@/components/patterns/MateriSelect';
import { SearchBar } from '@/components/patterns/SearchBar';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { strings } from '@/locales/id';

interface FilterSectionProps {
    searchValue: string;
    moduleId: string | null;
    moduleTitle: string | null;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectModule: (moduleId: string | null) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    moduleId,
    moduleTitle,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectModule,
    onClearFilters,
}: FilterSectionProps) => {
    const { selectedMaterial, rememberMaterials, selectMaterial } = useMaterialSelection(moduleId, onSelectModule);

    return (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
            <div className="min-w-0 flex-1">
                <SearchBar
                    label={strings.myQuiz.searchLabel}
                    placeholder={strings.myQuiz.searchPlaceholder}
                    value={searchValue}
                    onSubmit={onSearchSubmit}
                    hasFilters={hasFilters}
                    onClear={onClearFilters}
                    disabled={disabled}
                />
            </div>
            <MateriSelect
                value={moduleId}
                selected={selectedMaterial}
                onChange={selectMaterial}
                onMaterialsLoaded={rememberMaterials}
                fallbackLabel={moduleTitle}
                label={strings.myQuiz.moduleFilterLabel}
                placeholder={strings.myQuiz.moduleFilterPlaceholder}
                className="sm:w-80"
            />
        </div>
    );
};
