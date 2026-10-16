import { BookOpen } from 'lucide-react';
import { useState } from 'react';

import { AsyncCombobox, HighlightMatch } from '@/components/ui/AsyncCombobox';
import type { AsyncComboboxTexts } from '@/components/ui/AsyncCombobox';
import { ModuleCategoryBadge } from '@/components/ui/ModuleCategoryBadge';
import { useModuleSearch } from '@/hooks/useModuleSearch';
import { strings } from '@/locales/id';
import type { LearningModule } from '@/types/module';
import { shortId } from '@/utils/shortId';

const BASE_TEXTS: AsyncComboboxTexts = {
    label: strings.moduleSelect.label,
    placeholder: strings.moduleSelect.placeholder,
    clear: strings.moduleSelect.clear,
    empty: strings.moduleSelect.empty,
    failed: strings.moduleSelect.failed,
    count: (shown, total) =>
        `${strings.moduleSelect.showing} ${String(shown)} ${strings.moduleSelect.showingOf} ${String(total)} ${strings.moduleSelect.showingSuffix}`,
};

const MateriOption = ({ material, query }: { material: LearningModule; query: string }) => (
    <>
        <span className="flex min-w-0 flex-1 flex-col">
            <span className="text-body text-ink truncate font-medium">
                <HighlightMatch text={material.title} query={query} />
            </span>
            {/* {material.descriptionClean === null ? null : (
                <span className="text-caption text-muted truncate">{material.descriptionClean}</span>
            )} */}
        </span>
        {material.category === null ? null : <ModuleCategoryBadge category={material.category} />}
    </>
);

interface MateriSelectProps {
    value: string | null;
    selected: LearningModule | null;
    onChange: (material: LearningModule | null) => void;
    onMaterialsLoaded?: (items: LearningModule[]) => void;
    fallbackLabel?: string | null;
    label?: string;
    placeholder?: string;
    className?: string;
}

export const MateriSelect = ({
    value,
    selected,
    onChange,
    onMaterialsLoaded,
    fallbackLabel,
    label,
    placeholder,
    className,
}: MateriSelectProps) => {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const source = useModuleSearch(query, open, onMaterialsLoaded);

    return (
        <AsyncCombobox<LearningModule>
            source={source}
            query={query}
            onQueryChange={setQuery}
            open={open}
            onOpenChange={setOpen}
            selectedKey={value}
            selectedLabel={selected?.title ?? fallbackLabel ?? (value === null ? '' : shortId(value))}
            getKey={(material) => material.id}
            renderOption={(material, currentQuery) => <MateriOption material={material} query={currentQuery} />}
            onSelect={onChange}
            texts={{
                ...BASE_TEXTS,
                label: label ?? BASE_TEXTS.label,
                placeholder: placeholder ?? BASE_TEXTS.placeholder,
            }}
            leadingIcon={<BookOpen aria-hidden="true" className="text-muted size-4.5 shrink-0" />}
            className={className}
        />
    );
};
