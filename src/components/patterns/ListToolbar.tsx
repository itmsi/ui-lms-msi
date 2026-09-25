import type { ReactNode } from 'react';

import { SegmentedControl } from '@/components/ui/SegmentedControl';
import type { SegmentedOption } from '@/components/ui/SegmentedControl';
import { strings } from '@/locales/id';
import type { ModuleSort } from '@/types/module';

interface ListToolbarProps {
    title: string;
    total: number | null;
    sort: ModuleSort;
    onSelectSort: (sort: ModuleSort) => void;
    disabled: boolean;
    filter?: ReactNode;
    action?: ReactNode;
}

const SORT_OPTIONS: SegmentedOption<ModuleSort>[] = [
    { value: 'latest', label: strings.library.sortLatest },
    { value: 'title', label: strings.library.sortAlphabetical },
];

export const ListToolbar = ({ title, total, sort, onSelectSort, disabled, filter, action }: ListToolbarProps) => (
    <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="flex flex-col gap-0.5">
            <h2 className="text-section">{title}</h2>
            <p aria-live="polite" className="text-caption text-muted tabular-nums">
                {total === null ? ' ' : `${String(total)} ${strings.library.availableSuffix}`}
            </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {filter}

            <SegmentedControl
                label={strings.library.sortLabel}
                options={SORT_OPTIONS}
                value={sort}
                onChange={onSelectSort}
                disabled={disabled}
            />

            {action}
        </div>
    </div>
);
