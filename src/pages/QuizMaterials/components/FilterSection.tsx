import { MateriSelect } from '@/components/patterns/MateriSelect';
import { SearchBar } from '@/components/patterns/SearchBar';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { useMaterialSelection } from '@/hooks/useMaterialSelection';
import { strings } from '@/locales/id';
import type { QuizAudienceFilter } from '@/pages/QuizMaterials/types';

const AUDIENCE_OPTIONS: SegmentedOption<QuizAudienceFilter>[] = [
    { value: 'all', label: strings.quizMaterials.audienceAll },
    { value: 'reguler', label: strings.quizForm.audience.reguler },
    { value: 'mt', label: strings.quizForm.audience.mt },
];

interface FilterSectionProps {
    searchValue: string;
    moduleId: string | null;
    moduleTitle: string | null;
    audience: QuizAudienceFilter;
    hasFilters: boolean;
    disabled: boolean;
    onSearchSubmit: (value: string) => void;
    onSelectModule: (moduleId: string | null) => void;
    onSelectAudience: (audience: QuizAudienceFilter) => void;
    onClearFilters: () => void;
}

export const FilterSection = ({
    searchValue,
    moduleId,
    moduleTitle,
    audience,
    hasFilters,
    disabled,
    onSearchSubmit,
    onSelectModule,
    onSelectAudience,
    onClearFilters,
}: FilterSectionProps) => {
    const { selectedMaterial, rememberMaterials, selectMaterial } = useMaterialSelection(moduleId, onSelectModule);

    return (
        <div className="flex flex-col gap-3">
            <SearchBar
                label={strings.quizMaterials.searchLabel}
                placeholder={strings.quizMaterials.searchPlaceholder}
                value={searchValue}
                onSubmit={onSearchSubmit}
                hasFilters={hasFilters}
                onClear={onClearFilters}
                disabled={disabled}
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div className="flex flex-col gap-1.5 sm:w-96">
                    <span aria-hidden="true" className="text-body text-ink font-medium">
                        {strings.quizMaterials.moduleFilterLabel}
                    </span>
                    <MateriSelect
                        value={moduleId}
                        selected={selectedMaterial}
                        onChange={selectMaterial}
                        onMaterialsLoaded={rememberMaterials}
                        fallbackLabel={moduleTitle}
                        label={strings.quizMaterials.moduleFilterLabel}
                        placeholder={strings.quizMaterials.moduleFilterPlaceholder}
                    />
                </div>
                <SegmentedControl
                    label={strings.quizMaterials.audienceFilterLabel}
                    showlabel
                    options={AUDIENCE_OPTIONS}
                    value={audience}
                    onChange={onSelectAudience}
                    disabled={disabled}
                />
            </div>
        </div>
    );
};
