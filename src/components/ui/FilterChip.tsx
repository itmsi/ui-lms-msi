import { X } from 'lucide-react';

import { strings } from '@/locales/id';

interface FilterChipProps {
    label: string;
    value: string;
    onRemove: () => void;
}

export const FilterChip = ({ label, value, onRemove }: FilterChipProps) => (
    <span className="bg-primary-light text-primary-dark border-primary/30 text-caption inline-flex max-w-full items-center gap-1.5 rounded-full border py-1 pr-1 pl-3 font-medium">
        <span className="truncate">
            {label}: <span className="font-semibold">{value}</span>
        </span>
        <button
            type="button"
            onClick={onRemove}
            aria-label={`${strings.activityLog.removeFilter} ${label}`}
            className="hover:bg-primary/15 focus-visible:outline-primary flex size-6 shrink-0 items-center justify-center rounded-full transition-colors focus-visible:outline-2"
        >
            <X aria-hidden="true" className="size-3.5" />
        </button>
    </span>
);
